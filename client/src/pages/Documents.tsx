import { useState } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Calendar
} from 'lucide-react';
import { Link } from 'wouter';

const DOCUMENT_TYPES: DocumentType[] = ['BOOK', 'COURSE', 'DRAFT', 'STUDY', 'FOUNDATION', 'PROMPT', 'NOTE'];

export default function Documents() {
  const { t, documents, deleteDocument, uiLanguage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<DocumentType | 'ALL'>('ALL');
  const [filterLanguage, setFilterLanguage] = useState<Language | 'ALL'>('ALL');
  const [filterTag, setFilterTag] = useState('');

  const allTags = Array.from(new Set(documents.flatMap(doc => doc.tags)));

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || doc.type === filterType;
    const matchesLanguage = filterLanguage === 'ALL' || doc.language === filterLanguage;
    const matchesTag = !filterTag || doc.tags.includes(filterTag);
    
    return matchesSearch && matchesType && matchesLanguage && matchesTag;
  });

  const sortedDocuments = [...filteredDocuments].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const typeColors: Record<DocumentType, string> = {
    BOOK: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    COURSE: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    DRAFT: 'bg-gray-500/20 text-gray-600 dark:text-gray-400',
    STUDY: 'bg-green-500/20 text-green-600 dark:text-green-400',
    FOUNDATION: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
    PROMPT: 'bg-pink-500/20 text-pink-600 dark:text-pink-400',
    NOTE: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className="space-y-6" data-testid="page-documents">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-documents-title">
          {t('documents.title')}
        </h1>
        <Link href="/writing">
          <Button data-testid="button-new-document">
            <Plus className="h-4 w-4 me-2" />
            {t('documents.new')}
          </Button>
        </Link>
      </div>

      <Card data-testid="card-filters">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('placeholder.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-10"
                  data-testid="input-search"
                />
              </div>
            </div>

            <Select value={filterType} onValueChange={(v) => setFilterType(v as DocumentType | 'ALL')}>
              <SelectTrigger className="w-[160px]" data-testid="select-filter-type">
                <Filter className="h-4 w-4 me-2" />
                <SelectValue placeholder={t('documents.filterByType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('documents.all')}</SelectItem>
                {DOCUMENT_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{t(`type.${type}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterLanguage} onValueChange={(v) => setFilterLanguage(v as Language | 'ALL')}>
              <SelectTrigger className="w-[160px]" data-testid="select-filter-language">
                <SelectValue placeholder={t('documents.filterByLanguage')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t('documents.all')}</SelectItem>
                <SelectItem value="he">{t('lang.he')}</SelectItem>
                <SelectItem value="en">{t('lang.en')}</SelectItem>
              </SelectContent>
            </Select>

            {allTags.length > 0 && (
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-[160px]" data-testid="select-filter-tags">
                  <SelectValue placeholder={t('documents.filterByTags')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('documents.all')}</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {sortedDocuments.length === 0 ? (
        <Card data-testid="card-no-documents">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-4">{t('documents.noDocuments')}</p>
            <Link href="/writing">
              <Button data-testid="button-create-first">
                <Plus className="h-4 w-4 me-2" />
                {t('documents.new')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedDocuments.map(doc => (
            <Card 
              key={doc.id} 
              className="group hover-elevate"
              data-testid={`card-document-${doc.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">{doc.title}</CardTitle>
                  <Badge className={typeColors[doc.type]}>
                    {t(`type.${doc.type}`)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {doc.content || t('placeholder.content')}
                </p>

                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {doc.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {doc.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{doc.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                    <Badge variant="secondary" className="text-xs">
                      {doc.language === 'he' ? 'עב' : 'EN'}
                    </Badge>
                  </div>

                  <div className="flex gap-1">
                    <Link href={`/writing/${doc.id}`}>
                      <Button variant="ghost" size="icon" data-testid={`button-edit-${doc.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-delete-${doc.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
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
                          <AlertDialogCancel>{t('button.cancel')}</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteDocument(doc.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
          ))}
        </div>
      )}
    </div>
  );
}
