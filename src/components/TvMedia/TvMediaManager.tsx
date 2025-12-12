import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Upload,
  Trash2,
  Video,
  Image as ImageIcon,
  Loader2,
  Plus,
} from "lucide-react";
import {
  useAllMedia,
  useUploadMedia,
  useDeleteMedia,
  useToggleMediaActive,
  useReorderMedia,
} from "@/hooks/TvMedia";

function formatFileSize(bytes?: number): string {
  if (!bytes) return "-";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function TvMediaManager() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: mediaList, isLoading } = useAllMedia();
  const uploadMutation = useUploadMedia();
  const deleteMutation = useDeleteMedia();
  const toggleMutation = useToggleMediaActive();
  const reorderMutation = useReorderMedia();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      if (!uploadTitle) {
        // Auto-fill title from filename
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle) return;

    await uploadMutation.mutateAsync({
      file: uploadFile,
      title: uploadTitle,
      description: uploadDescription || undefined,
    });

    // Reset form
    setUploadFile(null);
    setUploadTitle("");
    setUploadDescription("");
    setIsUploadOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleToggle = async (id: number) => {
    await toggleMutation.mutateAsync(id);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  // Simple reorder: move up
  const handleMoveUp = async (index: number) => {
    if (index === 0 || !mediaList) return;
    const newOrder = [...mediaList];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    await reorderMutation.mutateAsync({
      orderedIds: newOrder.map((m) => m.id),
    });
  };

  // Simple reorder: move down
  const handleMoveDown = async (index: number) => {
    if (!mediaList || index === mediaList.length - 1) return;
    const newOrder = [...mediaList];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    await reorderMutation.mutateAsync({
      orderedIds: newOrder.map((m) => m.id),
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Videos para TV</CardTitle>
          <CardDescription>
            Gestiona los videos que se reproducen en la pantalla de espera
          </CardDescription>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Subir Video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subir nuevo video</DialogTitle>
              <DialogDescription>
                Sube un video que se reproducirá en la pantalla de espera
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="file">Archivo de video</Label>
                <Input
                  id="file"
                  type="file"
                  accept="video/*"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
                {uploadFile && (
                  <p className="text-sm text-muted-foreground">
                    {uploadFile.name} ({formatFileSize(uploadFile.size)})
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Nombre del video"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Descripción del video"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUploadOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!uploadFile || !uploadTitle || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {!mediaList || mediaList.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay videos cargados</p>
            <p className="text-sm">Haz clic en "Subir Video" para agregar uno</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mediaList.map((media, index) => (
              <div
                key={media.id}
                className={`flex items-center gap-4 p-4 border rounded-lg ${
                  media.isActive ? "bg-white" : "bg-gray-50 opacity-60"
                }`}
              >
                {/* Drag handle & order controls */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || reorderMutation.isPending}
                  >
                    <span className="sr-only">Mover arriba</span>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === mediaList.length - 1 || reorderMutation.isPending}
                  >
                    <span className="sr-only">Mover abajo</span>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Button>
                </div>

                {/* Thumbnail */}
                <div className="w-32 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  {media.thumbnailUrl ? (
                    <img
                      src={media.thumbnailUrl}
                      alt={media.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {media.mediaType === "VIDEO" ? (
                        <Video className="h-8 w-8 text-gray-400" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{media.title}</h4>
                    <Badge variant={media.isActive ? "default" : "secondary"}>
                      {media.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  {media.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {media.description}
                    </p>
                  )}
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{formatFileSize(media.fileSizeBytes)}</span>
                    <span>{formatDuration(media.durationSeconds)}</span>
                    <span>{media.mimeType}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`toggle-${media.id}`} className="text-sm">
                      {media.isActive ? "Activo" : "Inactivo"}
                    </Label>
                    <Switch
                      id={`toggle-${media.id}`}
                      checked={media.isActive}
                      onCheckedChange={() => handleToggle(media.id)}
                      disabled={toggleMutation.isPending}
                    />
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar video</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que quieres eliminar "{media.title}"?
                          Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(media.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Eliminar"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
