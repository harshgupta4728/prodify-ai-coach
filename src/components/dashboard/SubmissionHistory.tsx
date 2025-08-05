import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { History, Clock, Code, FileText, Calendar, CheckCircle, X } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Submission {
  _id: string;
  solution: {
    code: string;
    language: string;
  };
  language: string;
  timeSpent: number;
  notes?: string;
  solvedAt: string;
  executionTime?: number;
  memoryUsed?: number;
  runtimeBeats?: number;
  memoryBeats?: number;
}

interface SubmissionHistoryProps {
  problemId: string;
  problemTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SubmissionHistory = ({ problemId, problemTitle, isOpen, onClose }: SubmissionHistoryProps) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && problemId) {
      fetchSubmissions();
      // Reset selected submission when opening dialog for a new problem
      setSelectedSubmission(null);
    }
  }, [isOpen, problemId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProblemSubmissions(problemId);
      setSubmissions(response.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch submission history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      python: 'bg-blue-100 text-blue-800',
      javascript: 'bg-yellow-100 text-yellow-800',
      java: 'bg-orange-100 text-orange-800',
      cpp: 'bg-purple-100 text-purple-800',
      csharp: 'bg-green-100 text-green-800',
      go: 'bg-cyan-100 text-cyan-800',
      rust: 'bg-red-100 text-red-800'
    };
    return colors[language] || 'bg-gray-100 text-gray-800';
  };

  const getPerformanceColor = (beats: number) => {
    if (beats >= 90) return 'text-green-600';
    if (beats >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
             <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Submission History
          </DialogTitle>
          <DialogDescription>
            All your solutions for "{problemTitle}"
          </DialogDescription>
        </DialogHeader>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submissions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Submissions ({submissions.length})</h3>
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              )}
            </div>

                         <ScrollArea className="h-[300px]">
              {submissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No submissions found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((submission, index) => (
                    <Card 
                      key={submission._id}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedSubmission?._id === submission._id ? 'ring-2 ring-primary' : ''
                      }`}
                                             onClick={() => setSelectedSubmission(submission)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getLanguageColor(submission.language)}>
                              {submission.language}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              #{submissions.length - index}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTime(submission.timeSpent)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Submitted:</span>
                            <span>{formatDate(submission.solvedAt)}</span>
                          </div>

                          {submission.executionTime && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Runtime:</span>
                              <span className={getPerformanceColor(submission.runtimeBeats || 0)}>
                                {submission.executionTime}ms
                                {submission.runtimeBeats && ` (${submission.runtimeBeats}%)`}
                              </span>
                            </div>
                          )}

                          {submission.memoryUsed && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Memory:</span>
                              <span className={getPerformanceColor(submission.memoryBeats || 0)}>
                                {submission.memoryUsed}MB
                                {submission.memoryBeats && ` (${submission.memoryBeats}%)`}
                              </span>
                            </div>
                          )}
                        </div>

                        {submission.notes && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {submission.notes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Selected Submission Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Solution Details</h3>
            
            {selectedSubmission ? (
              <div className="space-y-4">
                {/* Submission Info */}
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Language:</span>
                        <Badge className={`ml-2 ${getLanguageColor(selectedSubmission.language)}`}>
                          {selectedSubmission.language}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time Spent:</span>
                        <span className="ml-2">{formatTime(selectedSubmission.timeSpent)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Submitted:</span>
                        <span className="ml-2">{formatDate(selectedSubmission.solvedAt)}</span>
                      </div>
                      {selectedSubmission.executionTime && (
                        <div>
                          <span className="text-muted-foreground">Runtime:</span>
                          <span className={`ml-2 ${getPerformanceColor(selectedSubmission.runtimeBeats || 0)}`}>
                            {selectedSubmission.executionTime}ms
                            {selectedSubmission.runtimeBeats && ` (${selectedSubmission.runtimeBeats}%)`}
                          </span>
                        </div>
                      )}
                      {selectedSubmission.memoryUsed && (
                        <div>
                          <span className="text-muted-foreground">Memory:</span>
                          <span className={`ml-2 ${getPerformanceColor(selectedSubmission.memoryBeats || 0)}`}>
                            {selectedSubmission.memoryUsed}MB
                            {selectedSubmission.memoryBeats && ` (${selectedSubmission.memoryBeats}%)`}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Code */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Solution Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <pre className="bg-muted p-4 rounded-lg text-sm font-mono whitespace-pre-wrap">
                        {selectedSubmission.solution?.code || 'No code available'}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>

                                 {/* Notes */}
                 <Card>
                   <CardHeader className="pb-3">
                     <CardTitle className="text-base flex items-center gap-2">
                       <FileText className="h-4 w-4" />
                       Notes
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <ScrollArea className="h-[150px]">
                       <div className="bg-muted p-4 rounded-lg">
                                                   <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {selectedSubmission.notes || 'No notes available'}
                          </p>
                       </div>
                     </ScrollArea>
                   </CardContent>
                 </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a submission to view details</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 