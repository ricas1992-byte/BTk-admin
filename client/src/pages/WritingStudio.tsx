import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { useApp, type DocumentType, type Language } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DOCUMENT_TYPES: DocumentType[] = ['BOOK', 'COURSE', 'DRAFT', 'STUDY', 'FOUNDATION', 'PROMPT', 'NOTE'];

function isContentEmpty(html: string): boolean {
  if (!html || !html.trim()) return true;
  const div = document.createElement('div');
  div.innerHTML = html;
  return !div.textContent?.trim();
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

  const BackIcon = uiLanguage === 'he' ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-6" data-testid="page-writing-studio">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/documents')}
            data-testid="button-back"
          >
            <BackIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold" data-testid="text-writing-title">
            {t('writing.title')}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {lastSaved && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>
                {t('writing.lastSaved')}: {lastSaved.toLocaleTimeString()}
              </span>
            </div>
          )}

          <Button 
            variant="outline" 
            onClick={exportDocument}
            disabled={isContentEmpty(content)}
            data-testid="button-export"
          >
            <Download className="h-4 w-4 me-2" />
            {t('button.export')}
          </Button>

          <Button 
            onClick={saveDocument}
            disabled={isSaving}
            data-testid="button-save"
          >
            <Save className="h-4 w-4 me-2" />
            {isSaving ? '...' : t('button.save')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-4">
          <Card data-testid="card-document-settings">
            <CardHeader>
              <CardTitle className="text-base">
                {uiLanguage === 'he' ? 'הגדרות מסמך' : 'Document Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">{t('writing.typeField')}</Label>
                <Select value={type} onValueChange={(v) => setType(v as DocumentType)}>
                  <SelectTrigger id="type" data-testid="select-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(docType => (
                      <SelectItem key={docType} value={docType}>
                        {t(`type.${docType}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">{t('writing.languageField')}</Label>
                <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                  <SelectTrigger id="language" data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="he">{t('lang.he')}</SelectItem>
                    <SelectItem value="en">{t('lang.en')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('writing.tagsField')}</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={t('placeholder.tags')}
                    className="flex-1"
                    data-testid="input-tag"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={addTag}
                    data-testid="button-add-tag"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className="gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive"
                          data-testid={`button-remove-tag-${tag}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm">{t('writing.autoSave')}</span>
                <Button
                  variant={autoSaveEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                  data-testid="button-toggle-autosave"
                >
                  {autoSaveEnabled ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {documents.length > 0 && (
            <Card data-testid="card-recent-documents">
              <CardHeader>
                <CardTitle className="text-base">
                  {uiLanguage === 'he' ? 'מסמכים אחרונים' : 'Recent Documents'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {documents.slice(0, 5).map(doc => (
                    <Button
                      key={doc.id}
                      variant={doc.id === documentId ? 'secondary' : 'ghost'}
                      className="w-full justify-start gap-2 text-start"
                      onClick={() => navigate(`/writing/${doc.id}`)}
                      data-testid={`button-recent-doc-${doc.id}`}
                    >
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{doc.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-3">
          <Card className="h-full" data-testid="card-editor">
            <CardContent className="p-6 space-y-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('placeholder.title')}
                className="text-xl font-semibold border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
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
