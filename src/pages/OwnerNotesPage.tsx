import React, { useState, useMemo } from 'react';
import { useSalon } from '@/contexts/SalonContext';
import { OwnerNote, NoteChecklistItem } from '@/types/salon';
import {
  StickyNote,
  Plus,
  Pin,
  PinOff,
  Trash2,
  Edit3,
  CheckSquare,
  Square,
  Search,
  Tag,
  Calendar,
  Lock,
  ListTodo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const NOTE_CATEGORIES = [
  'All',
  'Operations',
  'Financial',
  'Staffing',
  'Inventory',
  'Marketing',
  'General',
];

export const OwnerNotesPage: React.FC = () => {
  const { role, ownerNotes, addOwnerNote, updateOwnerNote, deleteOwnerNote, isOnline } = useSalon();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<OwnerNote | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<OwnerNote['category']>('Operations');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formTags, setFormTags] = useState('');
  const [checklistItems, setChecklistItems] = useState<Array<{ id: string; text: string; is_completed: boolean }>>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Filter notes
  const filteredNotes = useMemo(() => {
    return ownerNotes.filter((note) => {
      const matchCat = activeCategory === 'All' || note.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q) ||
        note.tags?.some((t) => t.toLowerCase().includes(q)) ||
        note.checklist_items?.some((c) => c.text.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [ownerNotes, activeCategory, searchQuery]);

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.is_pinned), [filteredNotes]);
  const otherNotes = useMemo(() => filteredNotes.filter((n) => !n.is_pinned), [filteredNotes]);

  // Access check
  if (role !== 'owner') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Owner Access Restricted</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          The &ldquo;My Notes&rdquo; lounge contains confidential salon financial targets, lease notes, and executive checklists reserved strictly for the Salon Owner.
        </p>
      </div>
    );
  }

  const handleOpenCreate = () => {
    setEditingNote(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('Operations');
    setFormIsPinned(false);
    setFormTags('');
    setChecklistItems([]);
    setNewChecklistText('');
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (note: OwnerNote) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormCategory(note.category);
    setFormIsPinned(Boolean(note.is_pinned));
    setFormTags(note.tags ? note.tags.join(', ') : '');
    setChecklistItems(note.checklist_items || []);
    setNewChecklistText('');
    setIsCreateModalOpen(true);
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklistItems((prev) => [
      ...prev,
      {
        id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        text: newChecklistText.trim(),
        is_completed: false,
      },
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleToggleChecklistInCard = async (note: OwnerNote, itemId: string) => {
    const updatedItems = (note.checklist_items || []).map((it) =>
      it.id === itemId ? { ...it, is_completed: !it.is_completed } : it
    );
    await updateOwnerNote(note.id, { checklist_items: updatedItems });
  };

  const handleTogglePin = async (note: OwnerNote) => {
    await updateOwnerNote(note.id, { is_pinned: !note.is_pinned });
    toast.success(note.is_pinned ? 'Note unpinned' : 'Note pinned to top');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Please enter a note title');
      return;
    }

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editingNote) {
      await updateOwnerNote(editingNote.id, {
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        is_pinned: formIsPinned,
        tags: tagsArray,
        checklist_items: checklistItems,
      });
    } else {
      await addOwnerNote({
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        is_pinned: formIsPinned,
        tags: tagsArray,
        checklist_items: checklistItems,
      });
    }

    setIsCreateModalOpen(false);
  };

  const renderNoteCard = (note: OwnerNote) => {
    const completedCount = note.checklist_items?.filter((c) => c.is_completed).length || 0;
    const totalCount = note.checklist_items?.length || 0;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
      <Card
        key={note.id}
        className={`relative overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col h-full ${
          note.is_pinned ? 'border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-sm' : 'bg-card'
        }`}
      >
        <CardHeader className="p-4 pb-2 space-y-2">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  {note.category}
                </Badge>
                {note.is_pinned && (
                  <Badge variant="default" className="text-[10px] px-2 py-0.5 rounded-full gap-1">
                    <Pin className="w-2.5 h-2.5" /> Pinned
                  </Badge>
                )}
              </div>
              <h3 className="font-bold text-sm sm:text-base text-foreground leading-snug break-words">
                {note.title}
              </h3>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleTogglePin(note)}
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                title={note.is_pinned ? 'Unpin note' : 'Pin to top'}
              >
                {note.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenEdit(note)}
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                title="Edit note"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm(`Delete note "${note.title}"?`)) {
                    deleteOwnerNote(note.id);
                  }
                }}
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-1 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {note.content && (
              <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            )}

            {/* Checklist Section */}
            {note.checklist_items && note.checklist_items.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-border/40">
                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground mb-1">
                  <span className="flex items-center gap-1">
                    <ListTodo className="w-3 h-3 text-primary" /> Checklist
                  </span>
                  <span>
                    {completedCount}/{totalCount} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mb-2">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                  {note.checklist_items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklistInCard(note, item.id)}
                      className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors text-xs"
                    >
                      {item.is_completed ? (
                        <CheckSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`flex-1 break-words leading-tight ${
                          item.is_completed ? 'line-through text-muted-foreground' : 'text-foreground font-medium'
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5 flex-wrap">
              {note.tags?.map((t) => (
                <span
                  key={t}
                  className="bg-muted/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground flex items-center gap-0.5"
                >
                  #{t}
                </span>
              ))}
            </div>
            <span className="shrink-0 flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3" />
              {note.created_at
                ? new Date(note.created_at).toLocaleDateString([], {
                    month: 'short',
                    day: '2-digit',
                  })
                : 'Today'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              <StickyNote className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              My Notes &amp; Executive Vault
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Private salon memos, K-Electric/generator logistics, lease milestones, and interactive checklists with real-time cloud synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={handleOpenCreate} className="gap-2 rounded-xl font-bold shadow-md shadow-primary/20">
            <Plus className="w-4 h-4" /> New Note
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 max-w-full scrollbar-none">
          {NOTE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, checklists, tags..."
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Pin className="w-3.5 h-3.5" /> Pinned Notes ({pinnedNotes.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => renderNoteCard(note))}
          </div>
        </div>
      )}

      {/* Regular Notes Section */}
      <div className="space-y-3">
        {pinnedNotes.length > 0 && otherNotes.length > 0 && (
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            All Notes ({otherNotes.length})
          </div>
        )}
        {otherNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherNotes.map((note) => renderNoteCard(note))}
          </div>
        ) : (
          pinnedNotes.length === 0 && (
            <div className="text-center py-16 bg-card border border-dashed rounded-2xl p-6 space-y-3">
              <StickyNote className="w-12 h-12 text-muted-foreground mx-auto stroke-1" />
              <h3 className="text-base font-bold text-foreground">No Notes Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery || activeCategory !== 'All'
                  ? 'No notes match your filter criteria. Try clearing search keywords.'
                  : 'Capture confidential ideas, staff guidelines, supplier negotiations, and task checklists here.'}
              </p>
              <Button onClick={handleOpenCreate} variant="outline" className="rounded-xl text-xs mt-2">
                <Plus className="w-3.5 h-3.5 mr-1" /> Create First Note
              </Button>
            </div>
          )
        )}
      </div>

      {/* Note Create / Edit Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg rounded-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-primary" />
              {editingNote ? 'Edit Executive Note' : 'Create New Executive Note'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Private memo with instant persistence and interactive checklist tasks.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Note Title *</label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Ramadan Midnight Shift & Diesel Generator Logistics"
                required
                className="text-xs h-9 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as OwnerNote['category'])}
                  className="w-full h-9 text-xs rounded-xl border border-input bg-background px-2"
                >
                  {NOTE_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-muted/40 hover:bg-muted/70 text-xs font-semibold border border-input">
                  <input
                    type="checkbox"
                    checked={formIsPinned}
                    onChange={(e) => setFormIsPinned(e.target.checked)}
                    className="rounded text-primary h-4 w-4"
                  />
                  <span>Pin to Top of Board</span>
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Memo / Details</label>
              <Textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Enter details, negotiation terms, numbers, or reminders..."
                rows={4}
                className="text-xs rounded-xl"
              />
            </div>

            {/* Checklist Builder */}
            <div className="space-y-2 pt-2 border-t">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Checklist Items ({checklistItems.length})</span>
                <span className="text-[10px] text-muted-foreground">Interactive tasks</span>
              </label>

              <div className="flex gap-2">
                <Input
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                  placeholder="Type task and press Enter or Add..."
                  className="text-xs h-9 rounded-xl flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddChecklistItem}
                  className="rounded-xl text-xs h-9 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>

              {checklistItems.length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto p-1 bg-muted/30 rounded-xl border">
                  {checklistItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 p-1.5 bg-background rounded-lg text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setChecklistItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, is_completed: !it.is_completed } : it))
                          );
                        }}
                        className="flex items-center gap-2 flex-1 text-left min-w-0"
                      >
                        {item.is_completed ? (
                          <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                        <span
                          className={`truncate ${
                            item.is_completed ? 'line-through text-muted-foreground' : 'font-medium'
                          }`}
                        >
                          {item.text}
                        </span>
                      </button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveChecklistItem(item.id)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Tags (Comma-separated)</label>
              <Input
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="e.g. Ramadan, Karachi, Lease, Generator"
                className="text-xs h-9 rounded-xl"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl font-bold">
                {editingNote ? 'Save Changes' : 'Create Note'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
