import { useState } from 'react';
import { Plus, Trash2, Users, CheckCircle2, Clock, AlertTriangle, ArrowRight, GripVertical, UserPlus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { TaskStatus, TaskPriority } from '@/lib/types';

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: typeof Clock; bgClass: string }> = {
  'todo': { label: 'รอดำเนินการ', color: '#64748B', icon: Clock, bgClass: 'bg-slate-500/10 border-slate-500/20' },
  'in-progress': { label: 'กำลังทำ', color: '#F59E0B', icon: AlertTriangle, bgClass: 'bg-amber-500/10 border-amber-500/20' },
  'done': { label: 'เสร็จแล้ว', color: '#10B981', icon: CheckCircle2, bgClass: 'bg-green-500/10 border-green-500/20' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  'low': { label: 'ต่ำ', color: '#64748B' },
  'medium': { label: 'ปานกลาง', color: '#06B6D4' },
  'high': { label: 'สูง', color: '#F59E0B' },
  'urgent': { label: 'เร่งด่วน', color: '#EF4444' },
};

const TEAM_COLORS = ['#00D9FF', '#FF8C42', '#A855F7', '#10B981', '#EF4444', '#F59E0B', '#06B6D4', '#8B5CF6'];

export default function TasksPage() {
  const { tasks, teamMembers, addTask, updateTask, deleteTask, moveTask, addTeamMember, deleteTeamMember } = useStore();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'board' | 'team'>('board');

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="animate-fade-up space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Task Management</h2>
          <p className="text-xs text-[#A0A0A0]">{tasks.length} งาน · {teamMembers.length} สมาชิก</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowTeamForm(true)} variant="outline" className="gap-2 border-[#A855F7]/30 text-[#A855F7] hover:bg-[#A855F7]/10 text-xs active:scale-95 transition-transform">
            <UserPlus size={14} /> เพิ่มสมาชิก
          </Button>
          <Button onClick={() => setShowTaskForm(true)} className="gap-2 bg-[#00D9FF] hover:bg-[#00B8D9] text-black font-semibold text-xs active:scale-95 transition-transform">
            <Plus size={14} /> เพิ่มงาน
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('board')}
          className={cn('px-4 py-2 rounded-lg text-xs font-medium transition-all border active:scale-95',
            activeTab === 'board' ? 'bg-[#00D9FF]/10 text-[#00D9FF] border-[#00D9FF]/30' : 'text-[#A0A0A0] border-transparent hover:bg-[#1E2730]'
          )}
        >
          📋 Kanban Board
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={cn('px-4 py-2 rounded-lg text-xs font-medium transition-all border active:scale-95',
            activeTab === 'team' ? 'bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/30' : 'text-[#A0A0A0] border-transparent hover:bg-[#1E2730]'
          )}
        >
          👥 ทีมงาน
        </button>
      </div>

      {activeTab === 'board' ? (
        /* Kanban Board */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['todo', 'in-progress', 'done'] as TaskStatus[]).map((status) => {
            const config = STATUS_CONFIG[status];
            const Icon = config.icon;
            const columnTasks = status === 'todo' ? todoTasks : status === 'in-progress' ? inProgressTasks : doneTasks;

            return (
              <div key={status} className="space-y-3">
                {/* Column Header */}
                <div className={cn('flex items-center gap-2 p-3 rounded-xl border', config.bgClass)}>
                  <Icon size={14} style={{ color: config.color }} />
                  <span className="text-xs font-semibold text-white">{config.label}</span>
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#A0A0A0]">{columnTasks.length}</span>
                </div>

                {/* Tasks */}
                <div className="space-y-2 min-h-[200px]">
                  {columnTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-[200px] border border-dashed border-[rgba(255,255,255,0.06)] rounded-xl">
                      <p className="text-xs text-[#A0A0A0]/50">ว่าง</p>
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const assignee = teamMembers.find(m => m.id === task.assigneeId);
                      const priorityConfig = PRIORITY_CONFIG[task.priority];
                      return (
                        <Card key={task.id} className="bg-[#1A1F26] border-[rgba(255,255,255,0.06)] group hover:border-[rgba(255,255,255,0.12)] transition-all">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <GripVertical size={12} className="text-[#A0A0A0]/30 mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white truncate">{task.title}</p>
                                {task.description && <p className="text-[10px] text-[#A0A0A0] mt-0.5 line-clamp-2">{task.description}</p>}
                                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${priorityConfig.color}20`, color: priorityConfig.color }}>
                                    {priorityConfig.label}
                                  </span>
                                  {task.dueDate && (
                                    <span className="text-[9px] text-[#A0A0A0]">📅 {task.dueDate}</span>
                                  )}
                                  {assignee && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${assignee.color}20`, color: assignee.color }}>
                                      {assignee.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {/* Actions */}
                            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[rgba(255,255,255,0.04)] opacity-0 group-hover:opacity-100 transition-opacity">
                              {status !== 'done' && (
                                <button
                                  onClick={() => moveTask(task.id, status === 'todo' ? 'in-progress' : 'done')}
                                  className="text-[9px] px-2 py-1 rounded-lg bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 transition-colors flex items-center gap-1"
                                >
                                  <ArrowRight size={10} /> {status === 'todo' ? 'เริ่มทำ' : 'เสร็จ'}
                                </button>
                              )}
                              {status === 'done' && (
                                <button
                                  onClick={() => moveTask(task.id, 'todo')}
                                  className="text-[9px] px-2 py-1 rounded-lg bg-[#64748B]/10 text-[#64748B] hover:bg-[#64748B]/20 transition-colors"
                                >
                                  ย้ายกลับ
                                </button>
                              )}
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="ml-auto text-[9px] px-2 py-1 rounded-lg bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Team Members */
        <div className="space-y-3">
          {teamMembers.length === 0 ? (
            <Card className="bg-[#1A1F26] border-[rgba(255,255,255,0.06)]">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users size={36} className="text-[#A0A0A0]/30 mb-3" />
                <p className="text-sm text-[#A0A0A0]">ยังไม่มีสมาชิก</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((member) => {
                const memberTasks = tasks.filter(t => t.assigneeId === member.id);
                const doneMemberTasks = memberTasks.filter(t => t.status === 'done');
                return (
                  <Card key={member.id} className="bg-[#1A1F26] border-[rgba(255,255,255,0.06)] group hover:border-[rgba(168,85,247,0.2)] transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: `${member.color}30`, border: `1px solid ${member.color}50` }}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                          <p className="text-[10px] text-[#A0A0A0]">{member.role}</p>
                        </div>
                        <button
                          onClick={() => deleteTeamMember(member.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-[#EF4444]/10 text-[#EF4444] transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-[#A0A0A0]">
                        <span>{memberTasks.length} งาน</span>
                        <span>{doneMemberTasks.length} เสร็จ</span>
                        {memberTasks.length > 0 && (
                          <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full rounded-full bg-[#10B981]" style={{ width: `${(doneMemberTasks.length / memberTasks.length) * 100}%` }} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Task Dialog */}
      <TaskFormDialog open={showTaskForm} onClose={() => setShowTaskForm(false)} />

      {/* Add Team Member Dialog */}
      <TeamFormDialog open={showTeamForm} onClose={() => setShowTeamForm(false)} />
    </div>
  );
}

function TaskFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addTask, teamMembers } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const reset = () => { setTitle(''); setDescription(''); setPriority('medium'); setAssigneeId(''); setDueDate(''); };

  const handleSubmit = () => {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      status: 'todo',
      priority,
      assigneeId: assigneeId || undefined,
      dueDate: dueDate || undefined,
    });
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md bg-[#1A1F26] border-[rgba(0,217,255,0.15)]">
        <DialogHeader>
          <DialogTitle className="text-white">เพิ่มงานใหม่</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-[#A0A0A0]">ชื่องาน *</Label>
            <Input placeholder="ชื่องาน..." value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
          </div>
          <div>
            <Label className="text-[#A0A0A0]">รายละเอียด</Label>
            <Input placeholder="รายละเอียดเพิ่มเติม..." value={description} onChange={(e) => setDescription(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[#A0A0A0]">ความสำคัญ</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#242B33] border-[rgba(255,255,255,0.08)]">
                  <SelectItem value="low">ต่ำ</SelectItem>
                  <SelectItem value="medium">ปานกลาง</SelectItem>
                  <SelectItem value="high">สูง</SelectItem>
                  <SelectItem value="urgent">เร่งด่วน</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#A0A0A0]">กำหนดส่ง</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
            </div>
          </div>
          {teamMembers.length > 0 && (
            <div>
              <Label className="text-[#A0A0A0]">มอบหมายให้</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white"><SelectValue placeholder="เลือกสมาชิก" /></SelectTrigger>
                <SelectContent className="bg-[#242B33] border-[rgba(255,255,255,0.08)]">
                  {teamMembers.map((m) => <SelectItem key={m.id} value={m.id}>{m.name} ({m.role})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(255,255,255,0.08)]">
            <Button variant="outline" onClick={() => { reset(); onClose(); }} className="border-[rgba(255,255,255,0.08)] text-[#A0A0A0]">ยกเลิก</Button>
            <Button onClick={handleSubmit} disabled={!title.trim()} className="bg-[#00D9FF] hover:bg-[#00B8D9] text-black font-semibold">เพิ่มงาน</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TeamFormDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addTeamMember, teamMembers } = useStore();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const reset = () => { setName(''); setRole(''); };

  const handleSubmit = () => {
    if (!name.trim()) return;
    const colorIndex = teamMembers.length % TEAM_COLORS.length;
    addTeamMember({
      name: name.trim(),
      role: role.trim() || 'Member',
      color: TEAM_COLORS[colorIndex],
    });
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm bg-[#1A1F26] border-[rgba(168,85,247,0.15)]">
        <DialogHeader>
          <DialogTitle className="text-white">เพิ่มสมาชิก</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-[#A0A0A0]">ชื่อ *</Label>
            <Input placeholder="ชื่อสมาชิก..." value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
          </div>
          <div>
            <Label className="text-[#A0A0A0]">ตำแหน่ง</Label>
            <Input placeholder="เช่น Agent, Admin, Manager..." value={role} onChange={(e) => setRole(e.target.value)} className="bg-[#242B33] border-[rgba(255,255,255,0.08)] text-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(255,255,255,0.08)]">
            <Button variant="outline" onClick={() => { reset(); onClose(); }} className="border-[rgba(255,255,255,0.08)] text-[#A0A0A0]">ยกเลิก</Button>
            <Button onClick={handleSubmit} disabled={!name.trim()} className="bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold">เพิ่มสมาชิก</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
