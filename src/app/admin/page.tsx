'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Search, 
  Eye, 
  Trash2, 
  ExternalLink,
  Calendar,
  User,
  Hash,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Tribute {
  id: string;
  slug: string;
  title: string;
  recipient: string;
  templateId: string;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
}

export default function AdminPage() {
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTributes();
  }, []);

  const fetchTributes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tributes');
      const data = await response.json();
      setTributes(data);
    } catch (error) {
      console.error('Failed to fetch tributes:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTribute = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tribute?')) return;
    
    try {
      const response = await fetch(`/api/tributes?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setTributes((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete tribute:', error);
    }
  };

  const filteredTributes = tributes.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-[100svh] bg-tone">
      {/* Header */}
      <header className="bg-tone sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-ink" />
            <span className="text-xl font-semibold text-ink">
              EternalPage Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={fetchTributes}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button asChild size="sm" className="bg-ink hover:bg-deep">
              <a href="/">Back to App</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-soft">
                Total Tributes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-ink tabular-nums">
                {tributes.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-soft">
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-ink tabular-nums">
                {tributes.reduce((acc, t) => acc + t.viewCount, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-soft">
                Published
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-ink tabular-nums">
                {tributes.filter((t) => t.isPublished).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-soft" />
            <Input
              placeholder="Search tributes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tributes list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-soft" />
          </div>
        ) : filteredTributes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-soft">No tributes found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTributes.map((tribute) => (
              <motion.div
                key={tribute.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-tone rounded-none border border-border p-4 hover:border-ink transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-ink truncate">
                        {tribute.title}
                      </h3>
                      {tribute.isPublished && (
                        <Badge variant="secondary" className="bg-tone text-ink">
                          Published
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-soft">
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {tribute.recipient}
                      </div>
                      <div className="flex items-center gap-1">
                        <Hash className="h-3.5 w-3.5" />
                        <code className="text-xs bg-tone px-1.5 py-0.5 rounded">
                          {tribute.slug}
                        </code>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(tribute.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {tribute.viewCount} views
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {tribute.templateId}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <a
                        href={`/${tribute.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTribute(tribute.id)}
                      className="text-soft hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
