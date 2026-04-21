'use client';

import React from 'react';
import { BookOpen, Target, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'exercise' | 'topic';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
}

interface NextStepsProps {
  recommendations: Recommendation[];
  currentLevel: string;
  progressToNextLevel: number;
  onStartRecommendation: (id: string) => void;
}

export const NextSteps = React.memo<NextStepsProps>(
  ({
    recommendations,
  }) => {
    const getIcon = (type: Recommendation['type']) => {
      switch (type) {
        case 'lesson':
          return <BookOpen className="h-4 w-4" />;
        case 'exercise':
          return <Target className="h-4 w-4" />;
        case 'topic':
          return <TrendingUp className="h-4 w-4" />;
      }
    };

    const getDifficultyColor = (difficulty: Recommendation['difficulty']) => {
      switch (difficulty) {
        case 'beginner':
          return 'text-green-600 bg-green-100';
        case 'intermediate':
          return 'text-yellow-600 bg-yellow-100';
        case 'advanced':
          return 'text-red-600 bg-red-100';
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Next Steps & Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recommendations */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">
              Recommended for You
            </h4>
            {recommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className="rounded-lg border p-4 transition-colors hover:bg-gray-50/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 items-start gap-3">
                    <div className="mt-1">{getIcon(recommendation.type)}</div>
                    <div className="flex-1">
                      <h5 className="mb-1 font-medium text-gray-900">
                        {recommendation.title}
                      </h5>
                      <p className="mb-2 text-sm text-gray-600">
                        {recommendation.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getDifficultyColor(
                            recommendation.difficulty
                          )}`}
                        >
                          {recommendation.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">
                          ~{recommendation.estimatedTime} min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
);

NextSteps.displayName = 'NextSteps';
