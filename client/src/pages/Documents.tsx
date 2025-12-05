import { useState, useMemo, useCallback } from 'react';
import { useApp, type DocumentType, type Language } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  Filter,
  FileText,
  Pencil,
  Trash2,
  Calendar,
  Tag
} from 'lucide-react';
import { Link } from 'wouter';

const DOCUMENT_TYPES: DocumentType[] = ['BOOK', 'COURSE', 'DRAFT', 'STUDY', 'FOUNDATION', 'PROMPT', 'NOTE'];

const typeStyles: Record<DocumentType, { bg: string; text: string; border: string }> = {
  BOOK: { bg: 'bg-pastel-blue', text: 'text-foreground', border: 'border-pastel-blue' },
  COURSE: { bg: 'bg-pastel-teal', text: 'text-foreground', border: 'border-pastel-teal' },
  DRAFT: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-muted' },
  STUDY: { bg: 'bg-pastel-green', text: 'text-foreground', border: 'border-pastel-green' },
  FOUNDATION: { bg: 'bg-pastel-beige', text: 'text-foreground', border: 'border-pastel-beige' },
  PROMPT: { bg: 'bg-pastel-rose', text: 'text-foreground', border: 'border-pastel-rose' },
  NOTE: { bg: 'bg-pastel-beige', text: 'text-foreground', border: 'border-pastel-beige' },
};

function stripHtml(html: string): string {
  if (!html) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export default function Documents() {
  const { t, documents, deleteDocument, uiLanguage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<DocumentType | 'ALL'>('ALL');
  const [filterLanguage, setFilterLanguage] = useState<Language | 'ALL'>('ALL');
  const [filterTag, setFilterTag] = useState('');

  const allTags = useMemo(() => 
    Array.from(new Set(documents.flatMap(doc => doc.tags))),
    [documents]
  );

  const sortedDocuments = useMemo(() => {
    const filtered = documents.filter(doc => {
      const plainContent = stripHtml(doc.content);
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plainContent.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'ALL' || doc.type === filterType;
      const matchesLanguage = filterLanguage === 'ALL' || doc.language === filterLanguage;
      const matchesTag = !filterTag || doc.tags.includes(filterTag);
      
      return matchesSearch && matchesType && matchesLanguage && matchesTag;
    });

    return [...filtered].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [documents, searchQuery, filterType, filterLanguage, filterTag]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const languageLabel = (lang: Language) => {
    const labels: Record<Language, string> = {
      he: 'עב',
      en: 'EN',
      ru: 'RU',
      ar: 'عر',
      es: 'ES',
      fr: 'FR'
    };
    return labels[lang] || lang.toUpperCase();
  };

  return (
    <div className="space-y-6" data-testid="page-documents">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-documents-title">
          {t('documents.title')}
        </h1>
        <Link href="/writing">
          <Button className="rounded-button touch-target" data-testid="button-new-document">
            <Plus className="h-4 w-4 me-2" />
            {t('documents.new')}
          </Button>
        </Link>
      </div>

      {/* Filters Card */}
      <Card className="shadow-card rounded-card" data-testid="card-filters">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[220px]">
              <div className="relative">
                <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('placeholder.search')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="ps-10 touch-target rounded-full border-border"
                  data-testid="input-search"
                />
              </div>
            </div>

            {/* Type Filter */}
            <Select value={filterType} onValueChange={(v) => setFilterType(v as DocumentType | 'ALL')}>
              <SelectTrigger className="w-[150px] touch-target rounded-button" data-testid="select-filter-type">
                <Filter className="h-4 w-4 me-2 text-muted-foreground" />
                <SelectValue placeholder={t('documents.filterByType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="touch-target">{t('documents.all')}</SelectItem>
                {DOCUMENT_TYPES.map(type => (
                  <SelectItem key={type} value={type} className="touch-target">
                    {t(`type.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Language Filter */}
            <Select value={filterLanguage} onValueChange={(v) => setFilterLanguage(v as Language | 'ALL')}>
              <SelectTrigger className="w-[140px] touch-target rounded-button" data-testid="select-filter-language">
                <SelectValue placeholder={t('documents.filterByLanguage')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="touch-target">{t('documents.all')}</SelectItem>
                <SelectItem value="he" className="touch-target">{t('lang.he')}</SelectItem>
                <SelectItem value="en" className="touch-target">{t('lang.en')}</SelectItem>
                <SelectItem value="ru" className="touch-target">{t('lang.ru')}</SelectItem>
                <SelectItem value="ar" className="touch-target">{t('lang.ar')}</SelectItem>
                <SelectItem value="es" className="touch-target">{t('lang.es')}</SelectItem>
                <SelectItem value="fr" className="touch-target">{t('lang.fr')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-[150px] touch-target rounded-button" data-testid="select-filter-tags">
                  <Tag className="h-4 w-4 me-2 text-muted-foreground" />
                  <SelectValue placeholder={t('documents.filterByTags')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="touch-target">{t('documents.all')}</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag} className="touch-target">{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid or Empty State */}
      {sortedDocuments.length === 0 ? (
        <Card className="shadow-card rounded-card" data-testid="card-no-documents">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-pastel-teal mb-4">
              <FileText className="h-10 w-10 text-primary" strokeWidth={1.5} />
            </div>
            <p className="text-lg text-muted-foreground mb-6">{t('documents.noDocuments')}</p>
            <Link href="/writing">
              <Button className="rounded-button touch-target" data-testid="button-create-first">
                <Plus className="h-4 w-4 me-2" />
                {t('documents.new')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {sortedDocuments.map(doc => {
            const style = typeStyles[doc.type];
            const plainContent = stripHtml(doc.content);
            
            return (
              <Card 
                key={doc.id} 
                className={`group shadow-card rounded-card border-2 ${style.border} hover:shadow-hover `}
                data-testid={`card-document-${doc.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-medium line-clamp-2 flex-1">
                      {doc.title}
                    </CardTitle>
                    <Badge className={`${style.bg} ${style.text} shrink-0`}>
                      {t(`type.${doc.type}`)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 min-h-[3.75rem]">
                    {plainContent || t('placeholder.content')}
                  </p>

                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {doc.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                      {doc.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          +{doc.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {languageLabel(doc.language)}
                      </Badge>
                    </div>

                    <div className="flex gap-0.5">
                      <Link href={`/writing/${doc.id}`}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          data-testid={`button-edit-${doc.id}`}
                        >
                          <Pencil className="h-4 w-4" strokeWidth={1.75} />
                        </Button>
                      </Link>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            data-testid={`button-delete-${doc.id}`}
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-card">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {uiLanguage === 'he' ? 'למחוק את המסמך?' : 'Delete document?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {uiLanguage === 'he' 
                                ? 'פעולה זו לא ניתנת לביטול. המסמך יימחק לצמיתות.'
                                : 'This action cannot be undone. The document will be permanently deleted.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="touch-target rounded-button">
                              {t('button.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteDocument(doc.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 touch-target rounded-button"
                            >
                              {t('button.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
