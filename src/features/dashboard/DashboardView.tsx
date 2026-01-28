/**
 * DashboardView - Pure presentation layer for dashboard
 * No business logic, only receives props and renders UI
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardHeader, CardFooter, Badge, Heading, Text } from '@/src/shared/ui';
import { MeetingResponseDtoCurrentPhase } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { PHASE_LABELS } from '@/src/shared/constants';
import { formatDate } from '@/src/shared/lib';
import { useDashboardViewModel } from './useDashboardViewModel';
import { DashboardSidebar } from './components/DashboardSidebar';
import { MeetingsFilter } from './components/MeetingsFilter';
import { DashboardTab } from './types';

export const DashboardView: React.FC = () => {
  const vm = useDashboardViewModel();

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50">
      <DashboardSidebar
        currentTab={vm.currentTab}
        onTabChange={vm.setTab}
        onLogout={vm.handleLogout}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-12 pb-40">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <Heading level="h2">
                {vm.currentTab === DashboardTab.MEETINGS ? 'Ваши встречи' : 'Ваши задачи'}
              </Heading>
              <Text variant="body" color="muted" className="mt-1">
                {vm.currentTab === DashboardTab.MEETINGS
                  ? 'Управляйте эффективностью ваших совещаний'
                  : 'Список ваших персональных целей'}
              </Text>
            </div>
            {vm.currentTab === DashboardTab.MEETINGS && (
              <Link to="/meeting/create">
                <Button
                  variant="success"
                  leftIcon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  }
                >
                  Создать встречу
                </Button>
              </Link>
            )}
          </div>

          {vm.currentTab === DashboardTab.MEETINGS && (
            <>
              <div className="flex justify-between items-center mb-6">
                <MeetingsFilter currentFilter={vm.filter} onFilterChange={vm.setFilter} />
              </div>

              {vm.meetingsLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
              ) : vm.filteredMeetings.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-slate-400 font-bold text-lg">Встречи отсутствуют</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vm.filteredMeetings.map((m) => (
                    <Link key={m._id} to={`/meeting/${m._id}`}>
                      <Card hover>
                        <CardHeader
                          icon={
                            <svg
                              className={`w-6 h-6 ${
                                m.currentPhase === MeetingResponseDtoCurrentPhase.finished
                                  ? 'text-slate-400'
                                  : 'text-blue-600'
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          }
                          title={m.title}
                          badge={
                            <Badge
                              variant={
                                m.currentPhase === MeetingResponseDtoCurrentPhase.finished
                                  ? 'secondary'
                                  : 'success'
                              }
                              size="sm"
                            >
                              {PHASE_LABELS[m.currentPhase]}
                            </Badge>
                          }
                        />
                        <CardFooter className="flex items-center justify-between">
                          <Text variant="small" color="muted">
                            {formatDate(m.createdAt)}
                          </Text>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {vm.currentTab === DashboardTab.TASKS && (
            <>
              {vm.tasksLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
              ) : vm.tasks.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-slate-400 font-bold text-lg">Задачи отсутствуют</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vm.tasks.map((t) => (
                    <Link key={t._id} to={`/task/${t._id}`}>
                      <Card hover>
                        <CardHeader
                          icon={
                            <svg
                              className="w-6 h-6 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          }
                          title={t.description}
                        />
                        <CardFooter className="flex items-center justify-between">
                          <Text variant="small" color="muted">
                            {formatDate(t.deadline)}
                          </Text>
                          <Badge variant={t.isCompleted ? 'success' : 'info'} size="sm">
                            {t.isCompleted ? 'Завершена' : 'В процессе'}
                          </Badge>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
