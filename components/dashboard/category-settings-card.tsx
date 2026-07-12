"use client";

import { useState, useEffect } from "react";
import { Tags, Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnimatedEmoji } from "@/components/ui/animated-emoji";
import { cn } from "@/lib/utils";
import fluentEmojisKeys from "@/lib/fluent-emojis-keys.json";
import { updateCategory, deleteCategory } from "@/app/actions";
import type { CategoryRow } from "@/lib/supabase/types";

const EMOJI_OPTIONS = fluentEmojisKeys as string[];

interface CategorySettingsCardProps {
  categories: CategoryRow[];
}

export function CategorySettingsCard({ categories }: CategorySettingsCardProps) {
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [visibleEmojiCount, setVisibleEmojiCount] = useState(60);

  // Form states
  const [editName, setEditName] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [editColor, setEditColor] = useState("");

  const userCategories = categories.filter((c) => !c.is_system);

  const handleEditClick = (category: CategoryRow) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditEmoji(category.emoji);
    setEditColor(category.color || "#10b981"); // Default emerald
    setErrorMsg("");
    setVisibleEmojiCount(60); // Reset count
    setIsEditDialogOpen(true);
  };

  const handleEmojiScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      setVisibleEmojiCount((prev) => Math.min(prev + 60, EMOJI_OPTIONS.length));
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCategory) return;
    
    setErrorMsg("");

    if (!editName.trim()) {
      setErrorMsg("Nama kategori tidak boleh kosong");
      return;
    }

    if (!editEmoji.trim()) {
      setErrorMsg("Emoji tidak boleh kosong");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateCategory(editingCategory.id, {
        name: editName,
        emoji: editEmoji,
        color: editColor,
      });

      if (result.success) {
        setIsEditDialogOpen(false);
        setSuccessMsg("Kategori berhasil diperbarui");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(result.error || "Gagal memperbarui kategori");
      }
    } catch (error) {
      setErrorMsg("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (category: CategoryRow) => {
    if (!confirm(`Hapus kategori "${category.name}"?`)) return;

    setIsLoading(true);
    try {
      const result = await deleteCategory(category.id);
      if (result.success) {
        setSuccessMsg("Kategori berhasil dihapus");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        alert(result.error || "Gagal menghapus kategori");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="shadow-sm border-[var(--card-border)]">
        <CardHeader className="p-4 sm:p-6 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
              <Tags className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-semibold">Kelola Kategori</CardTitle>
              <CardDescription className="text-[11px] sm:text-xs mt-0.5">
                Edit atau hapus kategori kustom Anda
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 px-4 sm:px-6 divide-y divide-[var(--card-border)]/30 pb-2">
          {successMsg && (
            <div className="my-3 rounded-xl bg-emerald-500/10 p-3 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center">
              {successMsg}
            </div>
          )}
          
          {userCategories.length === 0 ? (
            <div className="text-center py-6 text-[var(--muted-foreground)]">
              <Tags className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs font-medium">Belum ada kategori kustom</p>
            </div>
          ) : (
            <div className="flex flex-col max-h-[220px] overflow-y-auto custom-scrollbar pr-1 -mr-1">
              {userCategories.map((category) => (
                <div 
                  key={category.id} 
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm border border-[var(--card-border)]/50 bg-[var(--muted)]/20"
                    >
                      <AnimatedEmoji emoji={category.emoji} size={20} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-semibold text-[var(--foreground)] leading-none mb-1">
                        {category.name}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className="text-[8px] py-0 px-1.5 border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                      >
                        {category.type === "income" ? "Pemasukan" : "Pengeluaran"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-[var(--muted-foreground)] hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg"
                      onClick={() => handleEditClick(category)}
                      disabled={isLoading}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-[var(--muted-foreground)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg"
                      onClick={() => handleDelete(category)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent showHandle className="p-0 overflow-hidden rounded-t-[1.75rem] sm:rounded-2xl transition-all duration-200 max-w-md">
          <DialogHeader className="p-5 pb-3 border-b border-[var(--card-border)]/40 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <Tags className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold">
                  Edit Kategori
                </DialogTitle>
                <DialogDescription className="text-[11px] sm:text-xs mt-0.5 opacity-80">
                  Perbarui detail kategori Anda di sini.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="px-5 pt-4 pb-0 overflow-y-auto max-h-[76vh] sm:max-h-[550px] custom-scrollbar">
            <div className="space-y-4 pt-0.5 pb-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-xs font-semibold text-[var(--muted-foreground)]">Nama Kategori</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Mis. Makan Malam"
                  className="rounded-xl h-11 text-sm bg-[var(--muted)]/40 border-[var(--card-border)]/60 focus:bg-[var(--background)] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[var(--muted-foreground)]">Emoji</Label>
                <div 
                  className="grid grid-cols-6 gap-2 max-h-[160px] overflow-y-auto custom-scrollbar p-1"
                  onScroll={handleEmojiScroll}
                >
                  {EMOJI_OPTIONS.slice(0, visibleEmojiCount).map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setEditEmoji(emoji)}
                      className={cn(
                        "flex h-10 items-center justify-center rounded-lg border text-base transition-all",
                        editEmoji === emoji
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-[var(--card-border)] bg-[var(--card)] hover:bg-[var(--muted)]"
                      )}
                    >
                      <AnimatedEmoji emoji={emoji} size={24} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 hidden">
                <Label htmlFor="edit-color" className="text-xs font-semibold text-[var(--muted-foreground)]">Warna (Hex)</Label>
                <Input
                  id="edit-color"
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
              {errorMsg && (
                <div className="text-rose-500 text-xs font-medium bg-rose-500/10 p-2.5 rounded-xl text-center border border-rose-500/20">
                  {errorMsg}
                </div>
              )}
            </div>
          </div>
          
          <div className="sticky bottom-0 left-0 right-0 p-5 pt-4 bg-[var(--background)] border-t border-[var(--card-border)]/40 mt-auto z-10 flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)} 
              disabled={isLoading} 
              className="w-full rounded-xl h-11 font-semibold text-xs border-[var(--card-border)] bg-[var(--card)] hover:bg-[var(--muted)]"
            >
              Batal
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={isLoading} 
              className="w-full rounded-xl h-11 font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
