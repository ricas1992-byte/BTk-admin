import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { useApp, type DocumentType, type Language } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import RichTextEditor from '@/components/RichTextEditor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Save, 
  Download,
  X,
  Plus,
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  FileText,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DOCUMENT_TYPES: DocumentType[] = ['BOOK', 'COURSE', 'DRAFT', 'STUDY', 'FOUNDATION', 'PROMPT', 'NOTE'];

function isContentEmpty(html: string): boolean {
  if (!html || !html.trim()) return true;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return !doc.body.textContent?.trim();
}

export default function WritingStudio() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { t, uiLanguage, getDocument, addDocument, updateDocument, documents } = useApp();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<DocumentType>('DRAFT');
  const [language, setLanguage] = useState<Language>(uiLanguage);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(params.id || null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [focusMode, setFocusMode] = useState(false);

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (params.id) {
      const doc = getDocument(params.id);
      if (doc) {
        setDocumentId(doc.id);
        setTitle(doc.title);
        setType(doc.type);
        setLanguage(doc.language);
        setTags(doc.tags);
        setContent(doc.content);
        setLastSaved(new Date(doc.updatedAt));
      }
    } else {
      setDocumentId(null);
      setTitle('');
      setType('DRAFT');
      setLanguage(uiLanguage);
      setTags([]);
      setContent('');
      setLastSaved(null);
    }
  }, [params.id, getDocument, uiLanguage]);

  const saveDocument = useCallback(() => {
    if (!title.trim()) {
      toast({
        title: uiLanguage === 'he' ? 'שגיאה' : 'Error',
        description: uiLanguage === 'he' ? 'נא להזין כותרת' : 'Please enter a title',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      if (documentId) {
        updateDocument(documentId, {
          title,
          type,
          language,
          tags,
          content,
        });
      } else {
        const newDoc = addDocument({
          title,
          type,
          language,
          tags,
          content,
        });
        setDocumentId(newDoc.id);
        navigate(`/writing/${newDoc.id}`, { replace: true });
      }

      setLastSaved(new Date());
      toast({
        title: uiLanguage === 'he' ? 'נשמר' : 'Saved',
        description: uiLanguage === 'he' ? 'המסמך נשמר בהצלחה' : 'Document saved successfully',
      });
    } catch (error) {
      toast({
        title: uiLanguage === 'he' ? 'שגיאה' : 'Error',
        description: uiLanguage === 'he' ? 'שמירה נכשלה' : 'Failed to save',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [documentId, title, type, language, tags, content, addDocument, updateDocument, navigate, toast, uiLanguage]);

  useEffect(() => {
    if (!autoSaveEnabled || !title.trim()) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (title.trim() && (!isContentEmpty(content) || documentId)) {
        saveDocument();
      }
    }, 3000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, type, language, tags, content, autoSaveEnabled, documentId]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const exportDocument = () => {
    const doc = {
      title,
      type,
      language,
      tags,
      content,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'document'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: uiLanguage === 'he' ? 'יוצא' : 'Exported',
      description: uiLanguage === 'he' ? 'המסמך יוצא בהצלחה' : 'Document exported successfully',
    });
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };

  const BackIcon = uiLanguage === 'he' ? ArrowRight : ArrowLeft;

  if (focusMode) {
    return (
      <div
        className="focus-mode btk-fade-in-up"
        data-testid="focus-mode-container"
      >
        <div className="h-full flex flex-col">
          {/* Focus Mode Header - minimal toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              {lastSaved && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-pastel-green/50 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={saveDocument}
                disabled={isSaving}
                className="touch-target rounded-button"
                data-testid="button-focus-save"
              >
                <Save className="h-4 w-4 me-2" />
                {isSaving ? '...' : t('button.save')}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleFocusMode}
                className="touch-target h-11 w-11 rounded-full"
                data-testid="button-exit-focus"
              >
                <Minimize2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Focus Mode Content - centered typography */}
          <div className="flex-1 overflow-auto">
            <div className="focus-mode-content">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('placeholder.title')}
                className="title-input text-2xl font-semibold border-0 border-b-2 border-border/50 rounded-none px-0 py-4 mb-8 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
                data-testid="input-focus-title"
              />
              
              <div className="prose prose-lg max-w-none">
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder={t('placeholder.content')}
                  direction={language === 'he' ? 'rtl' : 'ltr'}
                  data-testid="rich-editor-focus"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-writing-studio">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/documents')}
            className="touch-target"
            data-testid="button-back"
          >
            <BackIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-writing-title">
            {t('writing.title')}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {lastSaved && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-1.5 bg-pastel-green rounded-full">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>
                {t('writing.lastSaved')}: {lastSaved.toLocaleTimeString()}
              </span>
            </div>
          )}

          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleFocusMode}
            className="touch-target rounded-button"
            title={uiLanguage === 'he' ? 'מצב מיקוד' : 'Focus Mode'}
            data-testid="button-focus-mode"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          <Button 
            variant="outline" 
            onClick={exportDocument}
            disabled={isContentEmpty(content)}
            className="touch-target rounded-button"
            data-testid="button-export"
          >
            <Download className="h-4 w-4 me-2" />
            {t('button.export')}
          </Button>

          <Button 
            onClick={saveDocument}
            disabled={isSaving}
            className="touch-target rounded-button"
            data-testid="button-save"
          >
            <Save className="h-4 w-4 me-2" />
            {isSaving ? '...' : t('button.save')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-4">
          <Card className="shadow-card rounded-card" data-testid="card-document-settings">
            <CardHeader>
              <CardTitle className="text-base">
                {uiLanguage === 'he' ? 'הגדרות מסמך' : 'Document Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">{t('writing.typeField')}</Label>
                <Select value={type} onValueChange={(v) => setType(v as DocumentType)}>
                  <SelectTrigger id="type" className="touch-target rounded-button" data-testid="select-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(docType => (
                      <SelectItem key={docType} value={docType} className="touch-target">
                        {t(`type.${docType}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-medium">{t('writing.languageField')}</Label>
                <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                  <SelectTrigger id="language" className="touch-target rounded-button" data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="he" className="touch-target">{t('lang.he')}</SelectItem>
                    <SelectItem value="en" className="touch-target">{t('lang.en')}</SelectItem>
                    <SelectItem value="ru" className="touch-target">{t('lang.ru')}</SelectItem>
                    <SelectItem value="ar" className="touch-target">{t('lang.ar')}</SelectItem>
                    <SelectItem value="es" className="touch-target">{t('lang.es')}</SelectItem>
                    <SelectItem value="fr" className="touch-target">{t('lang.fr')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('writing.tagsField')}</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={t('placeholder.tags')}
                    className="flex-1 touch-target rounded-button"
                    data-testid="input-tag"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={addTag}
                    className="touch-target rounded-button"
                    data-testid="button-add-tag"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className="gap-1.5 px-3 py-1"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive transition-colors"
                          data-testid={`button-remove-tag-${tag}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm font-medium">{t('writing.autoSave')}</span>
                <Switch
                  checked={autoSaveEnabled}
                  onCheckedChange={setAutoSaveEnabled}
                  data-testid="switch-autosave"
                />
              </div>
            </CardContent>
          </Card>

          {documents.length > 0 && (
            <Card className="shadow-card rounded-card" data-testid="card-recent-documents">
              <CardHeader>
                <CardTitle className="text-base">
                  {uiLanguage === 'he' ? 'מסמכים אחרונים' : 'Recent Documents'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {documents.slice(0, 5).map(doc => (
                    <Button
                      key={doc.id}
                      variant={doc.id === documentId ? 'secondary' : 'ghost'}
                      className="w-full justify-start gap-2.5 text-start touch-target rounded-button"
                      onClick={() => navigate(`/writing/${doc.id}`)}
                      data-testid={`button-recent-doc-${doc.id}`}
                    >
                      <FileText className="h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
                      <span className="truncate text-[15px]">{doc.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-3">
          <Card className="h-full shadow-card rounded-card" data-testid="card-editor">
            <CardContent className="p-6 space-y-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('placeholder.title')}
                className="text-xl font-semibold border-0 border-b-2 rounded-none px-0 py-2 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
                data-testid="input-title"
              />
              
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder={t('placeholder.content')}
                direction={language === 'he' ? 'rtl' : 'ltr'}
                data-testid="rich-editor"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
