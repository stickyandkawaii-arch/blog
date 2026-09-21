import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  Trash2,
  FileText,
  Users,
  MessageCircle,
  FolderHeart,
  HelpCircle,
  Download,
  Upload,
} from 'lucide-react';
import {
  createManualCloudBackup,
  getLatestCloudBackup,
  listCloudBackups,
  deleteCloudBackup,
  BlogBackupData,
  CloudBackupRecord,
} from '../lib/cloudBackupService';
import { Article, CategoryItem, Comment, NewsletterSubscriber, Poll, UserPollVotes, UserReactions } from '../types';

interface CloudSyncSectionProps {
  articles: Article[];
  categories: CategoryItem[];
  comments: Comment[];
  subscribers: NewsletterSubscriber[];
  polls?: Poll[];
  userPollVotes?: UserPollVotes;
  userReactions?: UserReactions;
  onRestoreData?: (data: BlogBackupData) => void;
}

export const CloudSyncSection: React.FC<CloudSyncSectionProps> = ({
  articles,
  categories,
  comments,
  subscribers,
  polls,
  userPollVotes,
  userReactions,
  onRestoreData,
}) => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccessMessage, setBackupSuccessMessage] = useState<string | null>(null);
  const [backupErrorMessage, setBackupErrorMessage] = useState<string | null>(null);

  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [backupsList, setBackupsList] = useState<CloudBackupRecord[]>([]);
  const [latestBackup, setLatestBackup] = useState<CloudBackupRecord | null>(null);
  const [backupNote, setBackupNote] = useState('');

  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoreSuccessMessage, setRestoreSuccessMessage] = useState<string | null>(null);

  const [jsonFileError, setJsonFileError] = useState<string | null>(null);
  const [jsonFileSuccess, setJsonFileSuccess] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load latest & backup history on mount
  const refreshBackups = async () => {
    setIsLoadingHistory(true);
    try {
      const [latest, list] = await Promise.all([
        getLatestCloudBackup(),
        listCloudBackups(10),
      ]);
      setLatestBackup(latest);
      setBackupsList(list);
    } catch (err: any) {
      console.error('Erreur chargement sauvegardes cloud:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    refreshBackups();
  }, []);

  // Trigger manual cloud backup
  const handleTriggerBackup = async () => {
    setIsBackingUp(true);
    setBackupSuccessMessage(null);
    setBackupErrorMessage(null);

    try {
      const payload: BlogBackupData = {
        articles,
        categories,
        comments,
        subscribers,
        polls,
        userPollVotes,
        userReactions,
      };

      const result = await createManualCloudBackup(
        payload,
        backupNote.trim() || 'Sauvegarde manuelle administrateur'
      );

      setBackupSuccessMessage(
        `Sauvegarde cloud réussie ! Identifiant : ${result.backupId}`
      );
      setBackupNote('');
      // Refresh list
      await refreshBackups();
      setTimeout(() => {
        setBackupSuccessMessage(null);
      }, 5000);
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde cloud Firestore:', error);
      setBackupErrorMessage(
        error?.message ||
          'Une erreur est survenue lors de la sauvegarde sur Firestore. Vérifiez la connexion.'
      );
    } finally {
      setIsBackingUp(false);
    }
  };

  // Restore a cloud backup
  const handleRestoreBackup = (record: CloudBackupRecord) => {
    if (!onRestoreData) return;
    setRestoringId(record.id);
    try {
      onRestoreData(record.data);
      setRestoreSuccessMessage(
        `Restauration réussie depuis la sauvegarde du ${new Date(
          record.createdAt
        ).toLocaleString('fr-FR')} (${record.articlesCount} articles, ${
          record.categoriesCount
        } catégories, ${record.commentsCount} commentaires).`
      );
      setConfirmRestoreId(null);
      setTimeout(() => {
        setRestoreSuccessMessage(null);
      }, 6000);
    } catch (e: any) {
      console.error('Erreur lors de la restauration:', e);
      setBackupErrorMessage('Impossible de restaurer les données.');
    } finally {
      setRestoringId(null);
    }
  };

  // Delete a backup from history
  const handleDeleteBackup = async (backupId: string) => {
    setDeletingId(backupId);
    try {
      await deleteCloudBackup(backupId);
      await refreshBackups();
    } catch (e) {
      console.error('Erreur suppression:', e);
    } finally {
      setDeletingId(null);
    }
  };

  // Export to JSON file
  const handleExportJSON = () => {
    try {
      const data: BlogBackupData = {
        articles,
        categories,
        comments,
        subscribers,
        polls,
        userPollVotes,
        userReactions,
      };

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      
      link.href = url;
      link.download = `blog-backup-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setJsonFileSuccess('Sauvegarde JSON générée et téléchargée avec succès.');
      setTimeout(() => setJsonFileSuccess(null), 5000);
    } catch (err) {
      console.error('Erreur lors de l\'export JSON:', err);
      setJsonFileError('Échec de la génération du fichier JSON.');
    }
  };

  // Import from JSON file
  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setJsonFileError(null);
    setJsonFileSuccess(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as BlogBackupData;

        // Basic validation
        if (!data.articles || !Array.isArray(data.articles)) {
          throw new Error('Le fichier ne semble pas être une sauvegarde de blog valide (articles manquants).');
        }

        if (onRestoreData) {
          onRestoreData(data);
          setJsonFileSuccess('Importation JSON réussie ! Le contenu du blog a été mis à jour.');
          if (fileInputRef.current) fileInputRef.current.value = '';
          setTimeout(() => setJsonFileSuccess(null), 5000);
        }
      } catch (err: any) {
        console.error('Erreur lors de l\'import JSON:', err);
        setJsonFileError(err.message || 'Le fichier JSON est invalide ou corrompu.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card: Cloud Status & Manual Trigger */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#fcfaff] to-[#f4effc] border border-[#d8c7f3] shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4C2882]/10 text-[#4C2882] text-xs font-extrabold uppercase tracking-wider">
              <Cloud className="w-3.5 h-3.5" />
              <span>Stockage Cloud Firestore</span>
            </div>
            <h3 className="text-lg font-extrabold text-[#3D2E39] font-heading">
              Sauvegarde manuelle du Blog sur le Cloud
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pour éviter les soucis de synchronisation ou de cache local du navigateur,
              vous pouvez déclencher manuellement une sauvegarde complète de tout le contenu
              (articles, catégories, commentaires, abonnés) dans votre base Firestore.
              <span className="font-semibold text-[#4C2882] ml-1">
                Aucune sauvegarde automatique n'est lancée en arrière-plan : vous gardez le contrôle total.
              </span>
            </p>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <input
              type="text"
              placeholder="Note optionnelle (ex: Avant refonte...)"
              value={backupNote}
              onChange={(e) => setBackupNote(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-[#d8c7f3] rounded-2xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4C2882]/30 w-full sm:w-64"
            />
            <button
              onClick={handleTriggerBackup}
              disabled={isBackingUp}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isBackingUp
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : 'bg-[#4C2882] hover:bg-[#3D206A] text-white'
              }`}
            >
              {isBackingUp ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sauvegarde en cours...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4" />
                  <span>Lancer une sauvegarde Cloud</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success / Error Alerts */}
        {backupSuccessMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{backupSuccessMessage}</span>
          </div>
        )}

        {backupErrorMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{backupErrorMessage}</span>
          </div>
        )}

        {restoreSuccessMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-[#4C2882] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#4C2882] shrink-0" />
            <span>{restoreSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Local JSON Backup Section */}
      <div className="p-6 rounded-3xl bg-white border border-[#e5dbf7] shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-extrabold uppercase tracking-wider">
              <Database className="w-3.5 h-3.5" />
              <span>Fichiers Locaux JSON</span>
            </div>
            <h3 className="text-lg font-extrabold text-[#3D2E39] font-heading">
              Sauvegarde et Importation JSON
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Exportez tout le contenu du blog dans un fichier JSON pour le conserver sur votre ordinateur. 
              Vous pouvez réimporter ce fichier à tout moment pour restaurer l'état exact du blog.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJSON}
              accept=".json"
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-2xl bg-white border border-[#d8c7f3] hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#4C2882]" />
              <span>Importer un JSON</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="px-5 py-2.5 rounded-2xl bg-[#4C2882] hover:bg-[#3D206A] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger JSON</span>
            </button>
          </div>
        </div>

        {/* JSON Alerts */}
        {jsonFileSuccess && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{jsonFileSuccess}</span>
          </div>
        )}

        {jsonFileError && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{jsonFileError}</span>
          </div>
        )}
      </div>

      {/* Snapshot Details & Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#e5dbf7] shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <FileText className="w-4 h-4 text-[#4C2882]" />
            <span className="text-[11px] font-bold">Articles actuels</span>
          </div>
          <p className="text-xl font-extrabold text-[#3D2E39]">{articles.length}</p>
          <p className="text-[10px] text-slate-400">À enregistrer</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e5dbf7] shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <FolderHeart className="w-4 h-4 text-pink-600" />
            <span className="text-[11px] font-bold">Catégories</span>
          </div>
          <p className="text-xl font-extrabold text-[#3D2E39]">{categories.length}</p>
          <p className="text-[10px] text-slate-400">Configurées</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e5dbf7] shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <MessageCircle className="w-4 h-4 text-amber-600" />
            <span className="text-[11px] font-bold">Commentaires</span>
          </div>
          <p className="text-xl font-extrabold text-[#3D2E39]">{comments.length}</p>
          <p className="text-[10px] text-slate-400">Lecteurs</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e5dbf7] shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Users className="w-4 h-4 text-teal-600" />
            <span className="text-[11px] font-bold">Abonnés</span>
          </div>
          <p className="text-xl font-extrabold text-[#3D2E39]">{subscribers.length}</p>
          <p className="text-[10px] text-slate-400">Inscrits</p>
        </div>
      </div>

      {/* Historical Cloud Backups List */}
      <div className="p-6 rounded-3xl bg-white border border-[#e5dbf7] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-[#3D2E39] font-heading flex items-center gap-2">
              <Database className="w-4 h-4 text-[#4C2882]" />
              <span>Historique des sauvegardes manuelles enregistrées</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Ces instantanés sont conservés de manière permanente sur votre base de données cloud Firestore.
            </p>
          </div>

          <button
            onClick={refreshBackups}
            disabled={isLoadingHistory}
            className="p-2 rounded-xl text-slate-400 hover:text-[#4C2882] hover:bg-[#f4effc] transition-colors cursor-pointer"
            title="Rafraîchir la liste"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoadingHistory && backupsList.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-[#4C2882]" />
            Chargement des sauvegardes Firestore...
          </div>
        ) : backupsList.length === 0 ? (
          <div className="py-10 text-center bg-[#faf7fd] rounded-2xl border border-dashed border-[#d8c7f3] p-6 text-slate-500">
            <Cloud className="w-8 h-8 mx-auto mb-2 text-[#4C2882]/40" />
            <p className="text-xs font-bold text-slate-700">Aucune sauvegarde cloud pour le moment</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">
              Cliquez sur le bouton "Lancer une sauvegarde Cloud" ci-dessus pour enregistrer votre tout premier instantané dans Firestore.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {backupsList.map((backup) => {
              const dateStr = new Date(backup.createdAt).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={backup.id}
                  className="p-4 hover:bg-[#faf7fd] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#3D2E39]">{dateStr}</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#4C2882]/10 text-[#4C2882] text-[10px] font-mono font-bold">
                        {backup.id}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span>📝 {backup.articlesCount} articles</span>
                      <span>•</span>
                      <span>🏷️ {backup.categoriesCount} catégories</span>
                      <span>•</span>
                      <span>💬 {backup.commentsCount} commentaires</span>
                      <span>•</span>
                      <span>📬 {backup.subscribersCount} abonnés</span>
                    </div>
                    {backup.note && (
                      <p className="text-[11px] text-slate-600 italic">« {backup.note} »</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {onRestoreData && (
                      confirmRestoreId === backup.id ? (
                        <div className="flex items-center gap-1.5 bg-amber-50 p-1 rounded-xl border border-amber-200">
                          <span className="text-[10px] font-bold text-amber-800 px-1">Restaurer ?</span>
                          <button
                            onClick={() => handleRestoreBackup(backup)}
                            disabled={restoringId === backup.id}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Oui
                          </button>
                          <button
                            onClick={() => setConfirmRestoreId(null)}
                            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Non
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmRestoreId(backup.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#4C2882] hover:text-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Restaurer cet instantané dans l'application"
                        >
                          <CloudDownload className="w-3.5 h-3.5" />
                          <span>Restaurer</span>
                        </button>
                      )
                    )}

                    <button
                      onClick={() => handleDeleteBackup(backup.id)}
                      disabled={deletingId === backup.id}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Supprimer cette sauvegarde"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Information footer explaining manual sync mechanism */}
      <div className="p-4 rounded-2xl bg-[#faf7fd] border border-[#e5dbf7] text-[11px] text-slate-500 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-[#4C2882] shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-700">Principe de fonctionnement :</strong> Lors de vos modifications quotidiennes, vos données restent instantanément accessibles et réactives dans votre navigateur. Dès que vous souhaitez figer une version officielle dans le Cloud ou sécuriser vos contenus contre une suppression accidentelle, lancez une sauvegarde manuelle via le bouton ci-dessus.
        </p>
      </div>
    </div>
  );
};
