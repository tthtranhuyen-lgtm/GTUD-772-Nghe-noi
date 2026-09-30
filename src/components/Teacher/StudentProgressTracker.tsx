import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { Users, TrendingUp, Award, CheckCircle2, Search, Plus, X, Mic, RotateCcw } from 'lucide-react';

interface StudentProgressTrackerProps {
  onOpenFeedback: (submissionId: string) => void;
}

export const StudentProgressTracker: React.FC<StudentProgressTrackerProps> = ({ onOpenFeedback }) => {
  const { students, addStudent, submissions, exercises, resetToDefaultClassData } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // New student form
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentChinese, setNewStudentChinese] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('Lớp Tiếng Trung HSK 1-2');
  const [newStudentGoal, setNewStudentGoal] = useState('Luyện phát âm chuẩn thanh điệu và giao tiếp trôi chảy');

  // Exercise map
  const exercisesMap = useMemo(() => {
    return new Map(exercises.map(e => [e.id, e]));
  }, [exercises]);

  // Compute student stats
  const studentStats = useMemo(() => {
    return students.map(student => {
      const studentSubs = submissions.filter(s => s.studentId === student.id);
      const gradedSubs = studentSubs.filter(s => s.status === 'graded');

      const avgScore = gradedSubs.length > 0
        ? (gradedSubs.reduce((acc, curr) => acc + (curr.grade?.totalScore || 0), 0) / gradedSubs.length).toFixed(1)
        : '—';

      const avgPronunciation = gradedSubs.length > 0
        ? (gradedSubs.reduce((acc, curr) => acc + (curr.grade?.rubricScores.pronunciation || 0), 0) / gradedSubs.length).toFixed(1)
        : '—';

      const completionRate = exercises.length > 0
        ? Math.round((studentSubs.length / Math.min(10, exercises.length)) * 100)
        : 0;

      return {
        student,
        totalSubmitted: studentSubs.length,
        gradedCount: gradedSubs.length,
        avgScore,
        avgPronunciation,
        completionRate: Math.min(100, completionRate),
        submissions: studentSubs
      };
    });
  }, [students, submissions, exercises]);

  const filteredStats = useMemo(() => {
    return studentStats.filter(s =>
      s.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.student.chineseName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [studentStats, searchQuery]);

  // Overall class averages
  const classAvgScore = useMemo(() => {
    const allGraded = submissions.filter(s => s.status === 'graded');
    if (allGraded.length === 0) return '—';
    return (allGraded.reduce((a, b) => a + (b.grade?.totalScore || 0), 0) / allGraded.length).toFixed(1);
  }, [submissions]);

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    addStudent(newStudentName.trim(), newStudentChinese.trim(), newStudentGrade, newStudentGoal);
    setShowAddStudentModal(false);
    setNewStudentName('');
    setNewStudentChinese('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Class Metrics */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Báo cáo & Phân tích lớp học
            </span>
            <span className="px-2 py-0.2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
              Lớp 10 học sinh
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Theo dõi tiến độ & Năng lực phát âm từng học sinh
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
            Thống kê tiến độ hoàn thành bài tập nghe, điểm phát âm thanh điệu tiếng Trung, số bài đã nộp và lịch sử phản hồi trực tiếp cho từng bạn.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => resetToDefaultClassData()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
            title="Khôi phục danh sách chuẩn 10 học sinh & bài tập"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục lớp mẫu</span>
          </button>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm học sinh mới</span>
          </button>
        </div>
      </div>

      {/* Class Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Sĩ số học sinh</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tabular-nums font-mono">
            {students.length} <span className="text-xs font-normal text-slate-400">bạn</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Điểm trung bình toàn lớp</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600 tabular-nums font-mono">
            {classAvgScore} <span className="text-xs font-normal text-slate-400">/ 10</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Tổng số bài nộp</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 tabular-nums font-mono">
            {submissions.length} <span className="text-xs font-normal text-slate-400">bài thu âm</span>
          </div>
        </div>
      </div>

      {/* Search & Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">
            Danh sách 10 học sinh trong lớp ({filteredStats.length})
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên học sinh, tên tiếng Trung..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredStats.map(stat => (
            <div
              key={stat.student.id}
              className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Student info */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={stat.student.avatar}
                    alt={stat.student.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {stat.student.studentNumber}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{stat.student.name}</h3>
                    <span className="text-sm font-bold text-indigo-600 font-sans">
                      {stat.student.chineseName}
                    </span>
                    <span className="px-2 py-0.2 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">
                      HS {stat.student.studentNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mục tiêu: {stat.student.targetGoal}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {stat.student.email} · {stat.student.gradeLevel}
                  </p>
                </div>
              </div>

              {/* Progress & Metrics */}
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-500">Đã nộp</span>
                    <span className="font-bold text-slate-800 font-mono ml-2">
                      {stat.totalSubmitted} bài ({stat.completionRate}%)
                    </span>
                  </div>
                  <div className="w-28 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${stat.completionRate}%` }}
                    />
                  </div>
                </div>

                <div className="text-center px-3">
                  <span className="text-[11px] text-slate-400 block font-medium">Điểm trung bình</span>
                  <span className="text-base font-extrabold text-indigo-600 font-mono tabular-nums">
                    {stat.avgScore}
                  </span>
                </div>

                <div className="text-center px-3">
                  <span className="text-[11px] text-slate-400 block font-medium">Điểm phát âm</span>
                  <span className="text-base font-extrabold text-emerald-600 font-mono tabular-nums">
                    {stat.avgPronunciation}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedStudent(stat.student)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Deep Dive Student Profile & Submissions History */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">{selectedStudent.name}</h2>
                    <span className="text-base font-bold text-indigo-600 font-sans">
                      {selectedStudent.chineseName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{selectedStudent.gradeLevel}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Target & Contact Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                <p>
                  <strong className="text-slate-900">Mục tiêu:</strong> {selectedStudent.targetGoal}
                </p>
                <p>
                  <strong className="text-slate-900">Email:</strong> {selectedStudent.email}
                </p>
                <p>
                  <strong className="text-slate-900">Ngày nhập học:</strong> {selectedStudent.enrolledDate}
                </p>
              </div>

              {/* Submissions of this student */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Lịch sử tất cả bài tập đã nộp
                </h3>

                {submissions.filter(s => s.studentId === selectedStudent.id).length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Học sinh chưa nộp bài nào.</p>
                ) : (
                  submissions
                    .filter(s => s.studentId === selectedStudent.id)
                    .map(sub => {
                      const ex = exercisesMap.get(sub.exerciseId);
                      return (
                        <div
                          key={sub.id}
                          className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {ex?.title || 'Bài tập nghe'}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              Nộp lúc: {sub.submittedAt} · {ex?.level}
                            </div>
                            {sub.grade && (
                              <p className="text-xs text-slate-600 italic mt-1 line-clamp-1">
                                "{sub.grade.feedbackText}"
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center gap-3">
                            {sub.status === 'graded' && sub.grade ? (
                              <div className="text-right">
                                <span className="text-sm font-black text-emerald-600 font-mono tabular-nums">
                                  {sub.grade.totalScore}/10
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                                Chờ chấm
                              </span>
                            )}

                            {sub.status === 'graded' && (
                              <button
                                onClick={() => {
                                  setSelectedStudent(null);
                                  onOpenFeedback(sub.id);
                                }}
                                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors"
                              >
                                Xem nhận xét
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Student */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Thêm học sinh mới vào lớp</h2>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Họ và tên học sinh (Tiếng Việt) *
                </label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  placeholder="Ví dụ: Lê Hoàng Long"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Tên chữ Hán (nếu có)
                </label>
                <input
                  type="text"
                  value={newStudentChinese}
                  onChange={e => setNewStudentChinese(e.target.value)}
                  placeholder="Ví dụ: 黎黄龙"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Lớp học</label>
                <input
                  type="text"
                  value={newStudentGrade}
                  onChange={e => setNewStudentGrade(e.target.value)}
                  placeholder="Ví dụ: Lớp Tiếng Trung HSK 1-2"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Mục tiêu luyện nghe & phát âm
                </label>
                <input
                  type="text"
                  value={newStudentGoal}
                  onChange={e => setNewStudentGoal(e.target.value)}
                  placeholder="Ví dụ: Phát âm chuẩn thanh điệu và giao tiếp tự tin"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Lưu học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
