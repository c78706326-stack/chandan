import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FileText,
  Trash2,
  ExternalLink,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Search,
  FolderPlus,
  Lock,
  User as UserIcon,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logout,
  getAccessToken,
} from '../services/googleAuth';
import {
  DriveFile,
  listDriveFiles,
  findOrCreateFolder,
  uploadFileToDrive,
  deleteDriveFile,
} from '../services/googleDrive';
import { CarEdition } from '../types/market';
import { engineAudio } from '../utils/audio';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
  currentEdition: CarEdition;
  currentPrice: number;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  currentEdition,
  currentPrice,
}) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Confirmation dialog state for destructive file deletions
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Load files when modal opens or user changes
  useEffect(() => {
    if (isOpen && currentUser) {
      loadFiles();
    }
  }, [isOpen, currentUser]);

  const loadFiles = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No active session token. Please sign in again.');
      }
      const targetFolderId = await findOrCreateFolder(token);
      setFolderId(targetFolderId);
      const driveFiles = await listDriveFiles(token, searchQuery, targetFolderId);
      setFiles(driveFiles);
    } catch (err: unknown) {
      console.error('Error loading Drive files:', err);
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to retrieve Google Drive files',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setStatusMessage(null);
      const result = await googleSignIn();
      if (result) {
        onUserChange(result.user);
        engineAudio.playClickTone('radar');
        setStatusMessage({
          type: 'success',
          text: `Connected to Google Drive as ${result.user.displayName || result.user.email}`,
        });
      }
    } catch (err: unknown) {
      console.error('Sign-in failed:', err);
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Sign-in was cancelled or failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    onUserChange(null);
    setFiles([]);
    setStatusMessage({
      type: 'info',
      text: 'Signed out of Google Drive',
    });
  };

  // Export current GT3 RS Appraisal Report to Google Drive
  const handleExportAppraisalReport = async () => {
    const token = await getAccessToken();
    if (!token) {
      setStatusMessage({ type: 'error', text: 'Please sign in with Google first.' });
      return;
    }

    setUploading(true);
    setStatusMessage(null);
    try {
      const targetFolderId = folderId || (await findOrCreateFolder(token));
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `Porsche_GT3RS_Market_Appraisal_${timestamp.slice(0, 10)}.md`;

      const reportContent = `# Porsche 911 GT3 RS Market Appraisal Report
**Generated**: ${new Date().toLocaleString()}
**Model Edition**: ${currentEdition.title} (${currentEdition.subtitle})
**Base MSRP**: $${currentEdition.msrp.toLocaleString()} USD
**Current Secondary Market Benchmark**: $${currentPrice.toLocaleString()} USD
**Appreciation Delta**: +$${(currentPrice - currentEdition.msrp).toLocaleString()} (+${(
        ((currentPrice - currentEdition.msrp) / currentEdition.msrp) *
        100
      ).toFixed(1)}%)

---

## Technical Specifications
- **Engine**: ${currentEdition.specs.engine}
- **Output**: ${currentEdition.specs.power}
- **Torque**: ${currentEdition.specs.torque}
- **0-100 km/h**: ${currentEdition.specs.acceleration}
- **Top Speed**: ${currentEdition.specs.topSpeed}
- **Active Downforce**: ${currentEdition.specs.downforce}
- **Transmission**: ${currentEdition.specs.transmission}

## Collector Intelligence
- **PTS Valuation**: Peach Refraction Paint-to-Sample allocation premium +$52,000 USD
- **Liquidity Rating**: 92/100 (High collector demand across BaT and RM Sotheby's)
- **Provenance**: Verified Stuttgart factory registry benchmark

*Report certified by Porsche 911 GT3 RS Intelligence Studio.*
`;

      const uploaded = await uploadFileToDrive(
        token,
        fileName,
        reportContent,
        'text/markdown',
        targetFolderId
      );

      engineAudio.playClickTone('radar');
      setStatusMessage({
        type: 'success',
        text: `Appraisal report "${uploaded.name}" saved to your Google Drive!`,
      });
      await loadFiles();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to upload report to Drive',
      });
    } finally {
      setUploading(false);
    }
  };

  // Export Spec Sheet to Google Drive
  const handleExportSpecSheet = async () => {
    const token = await getAccessToken();
    if (!token) {
      setStatusMessage({ type: 'error', text: 'Please sign in with Google first.' });
      return;
    }

    setUploading(true);
    setStatusMessage(null);
    try {
      const targetFolderId = folderId || (await findOrCreateFolder(token));
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `Porsche_GT3RS_Bespoke_Spec_${currentEdition.id}_${timestamp}.json`;

      const specContent = JSON.stringify(
        {
          model: 'Porsche 911 GT3 RS',
          edition: currentEdition.name,
          color: currentEdition.accentHex,
          msrp: currentEdition.msrp,
          secondaryValuation: currentPrice,
          specs: currentEdition.specs,
          exportedAt: new Date().toISOString(),
          vaultStatus: 'Certified Sonderwunsch Build Sheet',
        },
        null,
        2
      );

      const uploaded = await uploadFileToDrive(
        token,
        fileName,
        specContent,
        'application/json',
        targetFolderId
      );

      engineAudio.playClickTone('radar');
      setStatusMessage({
        type: 'success',
        text: `Specification file "${uploaded.name}" saved to Google Drive!`,
      });
      await loadFiles();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to upload spec sheet',
      });
    } finally {
      setUploading(false);
    }
  };

  // Perform deletion after user confirms
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Authentication expired');

      await deleteDriveFile(token, fileToDelete.id);
      engineAudio.playClickTone('shift');
      setStatusMessage({
        type: 'success',
        text: `Deleted "${fileToDelete.name}" from Google Drive`,
      });
      setFileToDelete(null);
      await loadFiles();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete file',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-[#FBFBFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-900">Google Drive Archives</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  WORKSPACE VAULT
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Directly store certified market valuations, telemetry appraisals, and spec sheets in your Google Drive.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account Bar & Authentication State */}
        <div className="px-6 py-4 border-b border-neutral-100 bg-[#FAFAFA] flex flex-wrap items-center justify-between gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Google User'}
                  className="w-9 h-9 rounded-full border border-neutral-200 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700">
                  <UserIcon className="w-5 h-5" />
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <span>{currentUser.displayName || 'Authenticated User'}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">{currentUser.email}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <Lock className="w-4 h-4 text-neutral-400" />
              <span>Connect your Google account to access your Porsche Drive vault</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {currentUser ? (
              <>
                <button
                  onClick={loadFiles}
                  disabled={loading}
                  className="p-2 rounded-xl border border-neutral-200 hover:bg-white text-neutral-600 hover:text-neutral-900 text-xs flex items-center gap-1.5 transition-colors"
                  title="Refresh files"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 rounded-xl border border-neutral-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-neutral-600 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </>
            ) : (
              /* Official Google Sign-In button implementation */
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="flex items-center gap-3 px-4 py-2 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl shadow-xs text-xs font-semibold text-neutral-800 transition-all hover:border-neutral-400 active:scale-98"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Status notification */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center justify-between ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-100'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-b border-rose-100'
                : 'bg-blue-50 text-blue-800 border-b border-blue-100'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : statusMessage.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              ) : (
                <Sparkles className="w-4 h-4 text-blue-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Action Export Buttons */}
        {currentUser && (
          <div className="px-6 py-4 bg-white border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Quick Export to Google Drive
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportAppraisalReport}
                disabled={uploading}
                className="px-3.5 py-2 rounded-xl bg-[#E8A588] hover:bg-[#ffbfa5] text-neutral-950 font-semibold text-xs flex items-center gap-2 transition-all shadow-xs active:scale-98 disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{uploading ? 'Exporting...' : 'Save Live Appraisal Report (.md)'}</span>
              </button>
              <button
                onClick={handleExportSpecSheet}
                disabled={uploading}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-xs active:scale-98 disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Save Bespoke Spec (.json)</span>
              </button>
            </div>
          </div>
        )}

        {/* Files Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {currentUser ? (
            <>
              {/* Search Bar */}
              <div className="flex items-center gap-2 p-2 rounded-xl border border-neutral-200 bg-neutral-50">
                <Search className="w-4 h-4 text-neutral-400 ml-1" />
                <input
                  type="text"
                  placeholder="Search files in Porsche GT3 RS Drive vault..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') loadFiles();
                  }}
                  className="w-full text-xs bg-transparent focus:outline-none text-neutral-800 placeholder:text-neutral-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      loadFiles();
                    }}
                    className="p-1 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Files Table / List */}
              {loading ? (
                <div className="py-16 text-center text-xs font-mono text-neutral-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-neutral-400" />
                  Syncing files with Google Drive...
                </div>
              ) : files.length > 0 ? (
                <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
                        <th className="py-3 px-4">Document / File Name</th>
                        <th className="py-3 px-4">Format</th>
                        <th className="py-3 px-4">Last Modified</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {files.map((file) => (
                        <tr key={file.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-neutral-900 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[#C86D51]" />
                              <span className="truncate max-w-xs">{file.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-neutral-500 text-[11px]">
                            {file.mimeType.split('/').pop() || 'file'}
                          </td>
                          <td className="py-3 px-4 text-neutral-500 text-[11px] font-mono">
                            {file.modifiedTime
                              ? new Date(file.modifiedTime).toLocaleDateString()
                              : '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors"
                                  title="Open in Google Drive"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => setFileToDelete(file)}
                                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-rose-50 hover:border-rose-200 text-neutral-500 hover:text-rose-600 transition-colors"
                                title="Delete file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center text-neutral-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                    <FolderPlus className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-neutral-800">
                    Your Porsche Drive Vault is empty
                  </div>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Export your current market appraisal or bespoke 911 GT3 RS configuration to create your first archived files.
                  </p>
                  <button
                    onClick={handleExportAppraisalReport}
                    disabled={uploading}
                    className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold inline-flex items-center gap-2 hover:bg-black transition-colors"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Generate & Upload First Report</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF5F0] border border-[#E8A588]/30 flex items-center justify-center mx-auto text-[#C86D51]">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Authentication Required
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 leading-relaxed">
                  Sign in with your Google account to grant permission for this applet to securely create, read, and manage your Porsche GT3 RS appraisal reports and configuration sheets in your Google Drive.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="inline-flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl shadow-xs text-xs font-semibold text-neutral-800 transition-all hover:border-neutral-400"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </svg>
                  <span>Connect Google Drive</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-[#FBFBFC] flex items-center justify-between text-xs text-neutral-500">
          <span>Google Drive OAuth 2.0 Integration</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white font-semibold text-xs hover:bg-black transition-colors"
          >
            Close Vault
          </button>
        </div>
      </motion.div>

      {/* Mandatory User Confirmation Dialog for Destructive Operations */}
      <AnimatePresence>
        {fileToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Delete File from Google Drive?
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Are you sure you want to delete <strong className="text-neutral-900">"{fileToDelete.name}"</strong>? This will permanently delete the file from your Google Drive account. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setFileToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
