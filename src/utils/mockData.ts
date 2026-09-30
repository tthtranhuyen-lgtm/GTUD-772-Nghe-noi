import { Exercise, Student, Submission, AppNotification } from '../types';
import { createSampleAudioBlob, saveAudioRecording } from './audioStorage';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    name: 'Tống Vân Anh',
    chineseName: '宋云英',
    studentNumber: 1,
    email: 'vananh.tong@school.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    gradeLevel: 'Lớp Tiếng Trung HSK 1-2',
    targetGoal: 'Phát âm chuẩn thanh điệu tiếng Trung & giao tiếp tự tin',
    enrolledDate: '10/02/2026'
  },
  {
    id: 'std-2',
    name: 'Nguyễn Việt Nhật Quang',
    chineseName: '阮越日光',
    studentNumber: 2,
    email: 'nhatquang.nguyen@school.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    gradeLevel: 'Lớp Tiếng Trung HSK 1-2',
    targetGoal: 'Luyện phản xạ nghe và trả lời trôi chảy',
    enrolledDate: '10/02/2026'
  },
  {
    id: 'std-3',
    name: 'Lê Dũng Tiến',
    chineseName: '黎勇进',
    studentNumber: 3,
    email: 'dungtien.le@school.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    gradeLevel: 'Lớp Tiếng Trung HSK 1-2',
    targetGoal: 'Nắm vững cấu trúc câu hỏi và mở rộng từ vựng',
    enrolledDate: '10/02/2026'
  },
  {
    id: 'std-4',
    name: 'Nguyễn Hoàng Thảo Vy',
    chineseName: '阮黄草薇',
    studentNumber: 4,
    email: 'thaovy.nguyen@school.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    gradeLevel: 'Lớp Tiếng Trung HSK 1-2',
    targetGoal: 'Cải thiện ngữ điệu nói tự nhiên như người bản xứ',
    enrolledDate: '10/02/2026'
  },
  {
    id: 'std-5',
    name: 'Duyên Hoàng Dung',
    chineseName: '缘黄蓉',
    studentNumber: 5,
    email: 'hoangdung.duyen@school.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    gradeLevel: 'Lớp Tiếng Trung HSK 1-2',
    targetGoal: 'Luyện nghe câu hỏi nhanh và ghi âm mạch lạc',
    enrolledDate: '10/02/2026'
  },
  {
    id: 'std-6',
    name: 'Nguyễn Huỳnh Thảo Dung',
    chineseName: '阮黄草蓉',
    studentNumber: 6,
    email: 'thaodung.nguyen@school.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    gradeLevel: 'Lớp Tiếng Trung HSK 1-2',
    targetGoal: 'Tự tin giao tiếp hàng ngày bằng tiếng Trung',
    enrolledDate: '10/02/2026'
  },
  {
    id: 'std-7',
    name: 'Nguyễn Ngọc Hải',
    chineseName: '阮玉海',
    studentNumber: 7,
    email: 'ngochai.nguyen@school.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    gradeLevel: 'Lớp Tiếng Trung HSK 1-2',
    targetGoal: 'Phát âm chuẩn biến điệu thanh ba và thanh nhẹ',
    enrolledDate: '10/02/2026'
  },
  {
    id: 'std-8',
    name: 'Trần Tuấn Hào',
    chineseName: '陈俊浩',
    studentNumber: 8,
    email: 'tuanhao.tran@school.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    gradeLevel: 'Lớp Tiếng Trung HSK 1-2',
    targetGoal: 'Nâng cao vốn từ vựng và phản xạ hội thoại',
    enrolledDate: '10/02/2026'
  },
  {
    id: 'std-9',
    name: 'Nguyễn Lê Bảo Ngọc',
    chineseName: '阮黎宝玉',
    studentNumber: 9,
    email: 'baongoc.nguyen@school.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    gradeLevel: 'Lớp Tiếng Trung HSK 1-2',
    targetGoal: 'Nghe hiểu câu dài và trả lời chuẩn ngữ pháp',
    enrolledDate: '10/02/2026'
  },
  {
    id: 'std-10',
    name: 'Hoàng Minh Trí',
    chineseName: '黄明智',
    studentNumber: 10,
    email: 'minhtri.hoang@school.edu.vn',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    gradeLevel: 'Lớp Tiếng Trung HSK 1-2',
    targetGoal: 'Luyện phát âm rõ ràng, chuẩn ngữ âm Bắc Kinh',
    enrolledDate: '10/02/2026'
  }
];

// Helper to build exercises for each student
export const INITIAL_EXERCISES: Exercise[] = [
  {
    id: 'ex-student-1',
    assignedStudentId: 'std-1',
    title: 'Bài tập 1: Luyện nghe & Thu âm trả lời (Tống Vân Anh 宋云英)',
    description: 'Nghe 8 câu hỏi tiếng Trung giao tiếp hàng ngày và ghi âm từng câu trả lời bằng tiếng Trung để giáo viên kiểm tra và sửa phát âm.',
    level: 'Sơ cấp (A1-A2)',
    topic: 'Tiếng Trung giao tiếp',
    language: 'zh',
    audioSourceType: 'tts',
    durationSeconds: 40,
    createdAt: '2026-03-30',
    createdBy: 'Giáo viên Tiếng Trung',
    vocabularyHints: [
      { word: '忙 (máng)', phonetic: 'máng', meaning: 'Bận rộn' },
      { word: '商店 (shāngdiàn)', phonetic: 'shāngdiàn', meaning: 'Cửa hàng, tiệm' },
      { word: '外语 (wàiyǔ)', phonetic: 'wàiyǔ', meaning: 'Ngoại ngữ' },
      { word: '邮局 (yóujú)', phonetic: 'yóujú', meaning: 'Bưu điện' },
      { word: '寄信 (jì xìn)', phonetic: 'jì xìn', meaning: 'Gửi thư' }
    ],
    ttsScript: '一、你工作忙吗？二、昨天你去哪儿？三、昨天你去商店吗？四、你学什么外语？五、你爸爸学英语吗？六、你朋友学韩国语吗？七、今天你去哪儿？八、明天你去邮局寄信吗？',
    transcript: '1. 你工作忙吗？(Nǐ gōngzuò máng ma?)\n2. 昨天你去哪儿？(Zuótiān nǐ qù nǎr?)\n3. 昨天你去商店吗？(Zuótiān nǐ qù shāngdiàn ma?)\n4. 你学什么外语？(Nǐ xué shénme wàiyǔ?)\n5. 你爸爸学英语吗？(Nǐ bàba xué yīngyǔ ma?)\n6. 你朋友学韩国语吗？(Nǐ péngyou xué hánguóyǔ ma?)\n7. 今天你去哪儿？(Jīntiān nǐ qù nǎr?)\n8. 明天你去邮局寄信吗？(Míngtiān nǐ qù yóujú jì xìn ma?)',
    questions: [
      {
        id: 'q1-1',
        type: 'audio_recording',
        prompt: '1. 你工作忙吗？',
        pinyin: 'Nǐ gōngzuò máng ma?',
        translationVi: 'Bạn làm việc có bận không?',
        guidePrompt: 'Gợi ý: 我工作很忙 / 我工作不太忙 / 我不忙。',
        targetDurationSec: 25
      },
      {
        id: 'q1-2',
        type: 'audio_recording',
        prompt: '2. 昨天你去哪儿？',
        pinyin: 'Zuótiān nǐ qù nǎr?',
        translationVi: 'Hôm qua bạn đi đâu?',
        guidePrompt: 'Gợi ý: 昨天我去学校 / 昨天我去超市 / 昨天我回家。',
        targetDurationSec: 25
      },
      {
        id: 'q1-3',
        type: 'audio_recording',
        prompt: '3. 昨天你去商店吗？',
        pinyin: 'Zuótiān nǐ qù shāngdiàn ma?',
        translationVi: 'Hôm qua bạn có đi cửa hàng không?',
        guidePrompt: 'Gợi ý: 昨天我去商店 / 昨天我没去商店。',
        targetDurationSec: 25
      },
      {
        id: 'q1-4',
        type: 'audio_recording',
        prompt: '4. 你学什么外语？',
        pinyin: 'Nǐ xué shénme wàiyǔ?',
        translationVi: 'Bạn học ngoại ngữ gì?',
        guidePrompt: 'Gợi ý: 我学汉语 / 我学英语和汉语。',
        targetDurationSec: 25
      },
      {
        id: 'q1-5',
        type: 'audio_recording',
        prompt: '5. 你爸爸学英语吗？',
        pinyin: 'Nǐ bàba xué yīngyǔ ma?',
        translationVi: 'Bố bạn có học tiếng Anh không?',
        guidePrompt: 'Gợi ý: 我爸爸不学英语 / 我爸爸学英语。',
        targetDurationSec: 25
      },
      {
        id: 'q1-6',
        type: 'audio_recording',
        prompt: '6. 你朋友学韩国语吗？',
        pinyin: 'Nǐ péngyou xué hánguóyǔ ma?',
        translationVi: 'Bạn của bạn có học tiếng Hàn không?',
        guidePrompt: 'Gợi ý: 他学韩国语 / 他不学韩国语，他学汉语。',
        targetDurationSec: 25
      },
      {
        id: 'q1-7',
        type: 'audio_recording',
        prompt: '7. 今天你去哪儿？',
        pinyin: 'Jīntiān nǐ qù nǎr?',
        translationVi: 'Hôm nay bạn đi đâu?',
        guidePrompt: 'Gợi ý: 今天我去银行 / 今天我去图书馆。',
        targetDurationSec: 25
      },
      {
        id: 'q1-8',
        type: 'audio_recording',
        prompt: '8. 明天你去邮局寄信吗？',
        pinyin: 'Míngtiān nǐ qù yóujú jì xìn ma?',
        translationVi: 'Ngày mai bạn có đi bưu điện gửi thư không?',
        guidePrompt: 'Gợi ý: 明天我去邮局寄信 / 明天我不去。',
        targetDurationSec: 25
      }
    ]
  },
  {
    id: 'ex-student-2',
    assignedStudentId: 'std-2',
    title: 'Bài tập 2: Luyện nghe & Thu âm trả lời (Nguyễn Việt Nhật Quang 阮越日光)',
    description: '8 câu hỏi luyện nghe và phản xạ trả lời: Ngân hàng, trung tâm thương mại, độ khó của tiếng Hán & tiếng Anh.',
    level: 'Sơ cấp (A1-A2)',
    topic: 'Tiếng Trung giao tiếp',
    language: 'zh',
    audioSourceType: 'tts',
    durationSeconds: 42,
    createdAt: '2026-03-30',
    createdBy: 'Giáo viên Tiếng Trung',
    vocabularyHints: [
      { word: '累 (lèi)', phonetic: 'lèi', meaning: 'Mệt mỏi' },
      { word: '取钱 (qǔ qián)', phonetic: 'qǔ qián', meaning: 'Rút tiền' },
      { word: '购物中心 (gòuwù zhōngxīn)', phonetic: 'gòuwù zhōngxīn', meaning: 'Trung tâm mua sắm' },
      { word: '难 (nán)', phonetic: 'nán', meaning: 'Khó' }
    ],
    ttsScript: '一、你累吗？二、今天你去银行取钱吗？三、今天你妈妈去购物中心吗？四、汉语难吗？五、英语难吗？六、明天你去哪儿？七、今天你去商店买东西吗？八、昨天你妈妈去超市买东西吗？',
    transcript: '1. 你累吗？(Nǐ lèi ma?)\n2. 今天你去银行取钱吗？(Jīntiān nǐ qù yínháng qǔ qián ma?)\n3. 今天你妈妈去购物中心吗？(Jīntiān nǐ māma qù gòuwù zhōngxīn ma?)\n4. 汉语难吗？(Hànyǔ nán ma?)\n5. 英语难吗？(Yīngyǔ nán ma?)\n6. 明天你去哪儿？(Míngtiān nǐ qù nǎr?)\n7. 今天你去商店买东西吗？(Jīntiān nǐ qù shāngdiàn mǎi dōngxi ma?)\n8. 昨天你妈妈去超市买东西吗？(Zuótiān nǐ māma qù chāoshì mǎi dōngxi ma?)',
    questions: [
      { id: 'q2-1', type: 'audio_recording', prompt: '1. 你累吗？', pinyin: 'Nǐ lèi ma?', translationVi: 'Bạn có mệt không?', guidePrompt: '我不太累 / 我很累。', targetDurationSec: 25 },
      { id: 'q2-2', type: 'audio_recording', prompt: '2. 今天你去银行取钱吗？', pinyin: 'Jīntiān nǐ qù yínháng qǔ qián ma?', translationVi: 'Hôm nay bạn có đi ngân hàng rút tiền không?', guidePrompt: '今天我去银行取钱 / 我不去。', targetDurationSec: 25 },
      { id: 'q2-3', type: 'audio_recording', prompt: '3. 今天你妈妈去购物中心吗？', pinyin: 'Jīntiān nǐ māma qù gòuwù zhōngxīn ma?', translationVi: 'Hôm nay mẹ bạn có đi trung tâm mua sắm không?', guidePrompt: '今天我妈妈去购物中心 / 她不去。', targetDurationSec: 25 },
      { id: 'q2-4', type: 'audio_recording', prompt: '4. 汉语难吗？', pinyin: 'Hànyǔ nán ma?', translationVi: 'Tiếng Trung có khó không?', guidePrompt: '汉语不太难，汉字很难，发音不太难。', targetDurationSec: 25 },
      { id: 'q2-5', type: 'audio_recording', prompt: '5. 英语难吗？', pinyin: 'Yīngyǔ nán ma?', translationVi: 'Tiếng Anh có khó không?', guidePrompt: '英语不难 / 英语很难。', targetDurationSec: 25 },
      { id: 'q2-6', type: 'audio_recording', prompt: '6. 明天你去哪儿？', pinyin: 'Míngtiān nǐ qù nǎr?', translationVi: 'Ngày mai bạn đi đâu?', guidePrompt: '明天我去学校学汉语。', targetDurationSec: 25 },
      { id: 'q2-7', type: 'audio_recording', prompt: '7. 今天你去商店买东西吗？', pinyin: 'Jīntiān nǐ qù shāngdiàn mǎi dōngxi ma?', translationVi: 'Hôm nay bạn có đi cửa hàng mua đồ không?', guidePrompt: '今天我去商店买东西 / 今天我不买。', targetDurationSec: 25 },
      { id: 'q2-8', type: 'audio_recording', prompt: '8. 昨天你妈妈去超市买东西吗？', pinyin: 'Zuótiān nǐ māma qù chāoshì mǎi dōngxi ma?', translationVi: 'Hôm qua mẹ bạn có đi siêu thị mua đồ không?', guidePrompt: '昨天她去超市买东西。', targetDurationSec: 25 }
    ]
  },
  {
    id: 'ex-student-3',
    assignedStudentId: 'std-3',
    title: 'Bài tập 3: Luyện nghe & Thu âm trả lời (Lê Dũng Tiến 黎勇进)',
    description: 'Hỏi về số người trong gia đình, học tập tại trung tâm tiếng Hán, mẹ học tiếng Nhật và đi gửi thư.',
    level: 'Sơ cấp (A1-A2)',
    topic: 'Tiếng Trung giao tiếp',
    language: 'zh',
    audioSourceType: 'tts',
    durationSeconds: 40,
    createdAt: '2026-03-30',
    createdBy: 'Giáo viên Tiếng Trung',
    vocabularyHints: [
      { word: '几口人 (jǐ kǒu rén)', phonetic: 'jǐ kǒu rén', meaning: 'Mấy người trong nhà' },
      { word: '汉语中心 (hànyǔ zhōngxīn)', phonetic: 'hànyǔ zhōngxīn', meaning: 'Trung tâm tiếng Hán' },
      { word: '日语 (rìyǔ)', phonetic: 'rìyǔ', meaning: 'Tiếng Nhật' }
    ],
    ttsScript: '一、你工作忙吗？二、你家有几口人？三、明天你去超市吗？四、今天你去汉语中心学汉语吗？五、你学汉语吗？六、你妈妈学日语吗？七、今天你去哪儿？八、明天你去邮局寄信吗？',
    transcript: '1. 你工作忙吗？\n2. 你家有几口人？\n3. 明天你去超市吗？\n4. 今天你去汉语中心学汉语吗？\n5. 你学汉语吗？\n6. 你妈妈学日语吗？\n7. 今天你去哪儿？\n8. 明天你去邮局寄信吗？',
    questions: [
      { id: 'q3-1', type: 'audio_recording', prompt: '1. 你工作忙吗？', pinyin: 'Nǐ gōngzuò máng ma?', translationVi: 'Bạn làm việc có bận không?', targetDurationSec: 25 },
      { id: 'q3-2', type: 'audio_recording', prompt: '2. 你家有几口人？', pinyin: 'Nǐ jiā yǒu jǐ kǒu rén?', translationVi: 'Nhà bạn có mấy người?', guidePrompt: '我家有四口人：爸爸、妈妈、哥哥和我。', targetDurationSec: 25 },
      { id: 'q3-3', type: 'audio_recording', prompt: '3. 明天你去超市吗？', pinyin: 'Míngtiān nǐ qù chāoshì ma?', translationVi: 'Ngày mai bạn có đi siêu thị không?', targetDurationSec: 25 },
      { id: 'q3-4', type: 'audio_recording', prompt: '4. 今天你去汉语中心学汉语吗？', pinyin: 'Jīntiān nǐ qù hànyǔ zhōngxīn xué hànyǔ ma?', translationVi: 'Hôm nay bạn có đến trung tâm tiếng Hán học không?', targetDurationSec: 25 },
      { id: 'q3-5', type: 'audio_recording', prompt: '5. 你学汉语吗？', pinyin: 'Nǐ xué hànyǔ ma?', translationVi: 'Bạn có học tiếng Trung không?', guidePrompt: '我学汉语。', targetDurationSec: 25 },
      { id: 'q3-6', type: 'audio_recording', prompt: '6. 你妈妈学日语吗？', pinyin: 'Nǐ māma xué rìyǔ ma?', translationVi: 'Mẹ bạn có học tiếng Nhật không?', guidePrompt: '我妈妈不学日语。', targetDurationSec: 25 },
      { id: 'q3-7', type: 'audio_recording', prompt: '7. 今天你去哪儿？', pinyin: 'Jīntiān nǐ qù nǎr?', translationVi: 'Hôm nay bạn đi đâu?', targetDurationSec: 25 },
      { id: 'q3-8', type: 'audio_recording', prompt: '8. 明天你去邮局寄信吗？', pinyin: 'Míngtiān nǐ qù yóujú jì xìn ma?', translationVi: 'Ngày mai bạn có đi bưu điện gửi thư không?', targetDurationSec: 25 }
    ]
  },
  {
    id: 'ex-student-4',
    assignedStudentId: 'std-4',
    title: 'Bài tập 4: Luyện nghe & Thu âm trả lời (Nguyễn Hoàng Thảo Vy 阮黄草薇)',
    description: 'Luyện tập hỏi về trạng thái sức khỏe, địa điểm ngày hôm qua, học ngoại ngữ và đi mua sắm.',
    level: 'Sơ cấp (A1-A2)',
    topic: 'Tiếng Trung giao tiếp',
    language: 'zh',
    audioSourceType: 'tts',
    durationSeconds: 40,
    createdAt: '2026-03-30',
    createdBy: 'Giáo viên Tiếng Trung',
    vocabularyHints: [
      { word: '累 (lèi)', phonetic: 'lèi', meaning: 'Mệt' },
      { word: '买东西 (mǎi dōngxi)', phonetic: 'mǎi dōngxi', meaning: 'Mua sắm đồ đạc' }
    ],
    ttsScript: '一、你累吗？二、昨天你去哪儿？三、昨天你去商店吗？四、你学什么外语？五、你爸爸学英语吗？六、你朋友学韩国语吗？七、今天你去商店买东西吗？八、昨天你妈妈去超市买东西吗？',
    transcript: '1. 你累吗？\n2. 昨天你去哪儿？\n3. 昨天你去商店吗？\n4. 你学什么外语？\n5. 你爸爸学英语吗？\n6. 你朋友学韩国语吗？\n7. 今天你去商店买东西吗？\n8. 昨天你妈妈去超市买东西吗？',
    questions: [
      { id: 'q4-1', type: 'audio_recording', prompt: '1. 你累吗？', pinyin: 'Nǐ lèi ma?', translationVi: 'Bạn có mệt không?', targetDurationSec: 25 },
      { id: 'q4-2', type: 'audio_recording', prompt: '2. 昨天你去哪儿？', pinyin: 'Zuótiān nǐ qù nǎr?', translationVi: 'Hôm qua bạn đi đâu?', targetDurationSec: 25 },
      { id: 'q4-3', type: 'audio_recording', prompt: '3. 昨天你去商店吗？', pinyin: 'Zuótiān nǐ qù shāngdiàn ma?', translationVi: 'Hôm qua bạn có đi cửa hàng không?', targetDurationSec: 25 },
      { id: 'q4-4', type: 'audio_recording', prompt: '4. 你学什么外语？', pinyin: 'Nǐ xué shénme wàiyǔ?', translationVi: 'Bạn học ngoại ngữ gì?', targetDurationSec: 25 },
      { id: 'q4-5', type: 'audio_recording', prompt: '5. 你爸爸学英语吗？', pinyin: 'Nǐ bàba xué yīngyǔ ma?', translationVi: 'Bố bạn có học tiếng Anh không?', targetDurationSec: 25 },
      { id: 'q4-6', type: 'audio_recording', prompt: '6. 你朋友学韩国语吗？', pinyin: 'Nǐ péngyou xué hánguóyǔ ma?', translationVi: 'Bạn của bạn có học tiếng Hàn không?', targetDurationSec: 25 },
      { id: 'q4-7', type: 'audio_recording', prompt: '7. 今天你去商店买东西吗？', pinyin: 'Jīntiān nǐ qù shāngdiàn mǎi dōngxi ma?', translationVi: 'Hôm nay bạn có đi tiệm mua đồ không?', targetDurationSec: 25 },
      { id: 'q4-8', type: 'audio_recording', prompt: '8. 昨天你妈妈去超市买东西吗？', pinyin: 'Zuótiān nǐ māma qù chāoshì mǎi dōngxi ma?', translationVi: 'Hôm qua mẹ bạn có đi siêu thị mua sắm không?', targetDurationSec: 25 }
    ]
  },
  {
    id: 'ex-student-5',
    assignedStudentId: 'std-5',
    title: 'Bài tập 5: Luyện nghe & Thu âm trả lời (Duyên Hoàng Dung 缘黄蓉)',
    description: 'Hỏi công việc bận rộn, người trong nhà, rút tiền ngân hàng, mẹ đi mua sắm và bưu điện.',
    level: 'Sơ cấp (A1-A2)',
    topic: 'Tiếng Trung giao tiếp',
    language: 'zh',
    audioSourceType: 'tts',
    durationSeconds: 40,
    createdAt: '2026-03-30',
    createdBy: 'Giáo viên Tiếng Trung',
    vocabularyHints: [
      { word: '银行 (yínháng)', phonetic: 'yínháng', meaning: 'Ngân hàng' },
      { word: '取钱 (qǔ qián)', phonetic: 'qǔ qián', meaning: 'Rút tiền' }
    ],
    ttsScript: '一、你工作忙吗？二、你家有几口人？三、今天你去银行取钱吗？四、今天你妈妈去购物中心吗？五、汉语难吗？六、英语难吗？七、明天你去哪儿？八、明天你去邮局寄信吗？',
    transcript: '1. 你工作忙吗？\n2. 你家有几口人？\n3. 今天你去银行取钱吗？\n4. 今天你妈妈去购物中心吗？\n5. 汉语难吗？\n6. 英语难吗？\n7. 明天你去哪儿？\n8. 明天你去邮局寄信吗？',
    questions: [
      { id: 'q5-1', type: 'audio_recording', prompt: '1. 你工作忙吗？', pinyin: 'Nǐ gōngzuò máng ma?', translationVi: 'Bạn làm việc có bận không?', targetDurationSec: 25 },
      { id: 'q5-2', type: 'audio_recording', prompt: '2. 你家有几口人？', pinyin: 'Nǐ jiā yǒu jǐ kǒu rén?', translationVi: 'Nhà bạn có mấy người?', targetDurationSec: 25 },
      { id: 'q5-3', type: 'audio_recording', prompt: '3. 今天你去银行取钱吗？', pinyin: 'Jīntiān nǐ qù yínháng qǔ qián ma?', translationVi: 'Hôm nay bạn có đi ngân hàng rút tiền không?', targetDurationSec: 25 },
      { id: 'q5-4', type: 'audio_recording', prompt: '4. 今天你妈妈去购物中心吗？', pinyin: 'Jīntiān nǐ māma qù gòuwù zhōngxīn ma?', translationVi: 'Hôm nay mẹ bạn có đi trung tâm mua sắm không?', targetDurationSec: 25 },
      { id: 'q5-5', type: 'audio_recording', prompt: '5. 汉语难吗？', pinyin: 'Hànyǔ nán ma?', translationVi: 'Tiếng Hán có khó không?', targetDurationSec: 25 },
      { id: 'q5-6', type: 'audio_recording', prompt: '6. 英语难吗？', pinyin: 'Yīngyǔ nán ma?', translationVi: 'Tiếng Anh có khó không?', targetDurationSec: 25 },
      { id: 'q5-7', type: 'audio_recording', prompt: '7. 明天你去哪儿？', pinyin: 'Míngtiān nǐ qù nǎr?', translationVi: 'Ngày mai bạn đi đâu?', targetDurationSec: 25 },
      { id: 'q5-8', type: 'audio_recording', prompt: '8. 明天你去邮局寄信吗？', pinyin: 'Míngtiān nǐ qù yóujú jì xìn ma?', translationVi: 'Ngày mai bạn có đi bưu điện gửi thư không?', targetDurationSec: 25 }
    ]
  },
  {
    id: 'ex-student-6',
    assignedStudentId: 'std-6',
    title: 'Bài tập 6: Luyện nghe & Thu âm trả lời (Nguyễn Huỳnh Thảo Dung 阮黄草蓉)',
    description: 'Hỏi về cảm giác mệt, đi trung tâm tiếng Hán, học tiếng Nhật, siêu thị và đi đâu hôm nay.',
    level: 'Sơ cấp (A1-A2)',
    topic: 'Tiếng Trung giao tiếp',
    language: 'zh',
    audioSourceType: 'tts',
    durationSeconds: 40,
    createdAt: '2026-03-30',
    createdBy: 'Giáo viên Tiếng Trung',
    vocabularyHints: [
      { word: '超市 (chāoshì)', phonetic: 'chāoshì', meaning: 'Siêu thị' },
      { word: '日语 (rìyǔ)', phonetic: 'rìyǔ', meaning: 'Tiếng Nhật' }
    ],
    ttsScript: '一、你累吗？二、昨天你去哪儿？三、明天你去超市吗？四、今天你去汉语中心学汉语吗？五、你学汉语吗？六、你妈妈学日语吗？七、今天你去哪儿？八、昨天你妈妈去超市买东西吗？',
    transcript: '1. 你累吗？\n2. 昨天你去哪儿？\n3. 明天你去超市吗？\n4. 今天你去汉语中心学汉语吗？\n5. 你学汉语吗？\n6. 你妈妈学日语吗？\n7. 今天你去哪儿？\n8. 昨天你妈妈去超市买东西吗？',
    questions: [
      { id: 'q6-1', type: 'audio_recording', prompt: '1. 你累吗？', pinyin: 'Nǐ lèi ma?', translationVi: 'Bạn có mệt không?', targetDurationSec: 25 },
      { id: 'q6-2', type: 'audio_recording', prompt: '2. 昨天你去哪儿？', pinyin: 'Zuótiān nǐ qù nǎr?', translationVi: 'Hôm qua bạn đi đâu?', targetDurationSec: 25 },
      { id: 'q6-3', type: 'audio_recording', prompt: '3. 明天你去超市吗？', pinyin: 'Míngtiān nǐ qù chāoshì ma?', translationVi: 'Ngày mai bạn có đi siêu thị không?', targetDurationSec: 25 },
      { id: 'q6-4', type: 'audio_recording', prompt: '4. 今天你去汉语中心学汉语吗？', pinyin: 'Jīntiān nǐ qù hànyǔ zhōngxīn xué hànyǔ ma?', translationVi: 'Hôm nay bạn có đến trung tâm tiếng Hán học không?', targetDurationSec: 25 },
      { id: 'q6-5', type: 'audio_recording', prompt: '5. 你学汉语吗？', pinyin: 'Nǐ xué hànyǔ ma?', translationVi: 'Bạn có học tiếng Trung không?', targetDurationSec: 25 },
      { id: 'q6-6', type: 'audio_recording', prompt: '6. 你妈妈学日语吗？', pinyin: 'Nǐ māma xué rìyǔ ma?', translationVi: 'Mẹ bạn có học tiếng Nhật không?', targetDurationSec: 25 },
      { id: 'q6-7', type: 'audio_recording', prompt: '7. 今天你去哪儿？', pinyin: 'Jīntiān nǐ qù nǎr?', translationVi: 'Hôm nay bạn đi đâu?', targetDurationSec: 25 },
      { id: 'q6-8', type: 'audio_recording', prompt: '8. 昨天你妈妈去超市买东西吗？', pinyin: 'Zuótiān nǐ māma qù chāoshì mǎi dōngxi ma?', translationVi: 'Hôm qua mẹ bạn có đi siêu thị mua sắm không?', targetDurationSec: 25 }
    ]
  },
  {
    id: 'ex-student-7',
    assignedStudentId: 'std-7',
    title: 'Bài tập 7: Luyện nghe & Thu âm trả lời (Nguyễn Ngọc Hải 阮玉海)',
    description: 'Hỏi về công việc, số nhân khẩu trong gia đình, rút tiền ngân hàng, học ngoại ngữ và mua đồ.',
    level: 'Sơ cấp (A1-A2)',
    topic: 'Tiếng Trung giao tiếp',
    language: 'zh',
    audioSourceType: 'tts',
    durationSeconds: 40,
    createdAt: '2026-03-30',
    createdBy: 'Giáo viên Tiếng Trung',
    vocabularyHints: [
      { word: '韩国语 (hánguóyǔ)', phonetic: 'hánguóyǔ', meaning: 'Tiếng Hàn Quốc' }
    ],
    ttsScript: '一、你工作忙吗？二、你家有几口人？三、今天你去银行取钱吗？四、昨天你去商店吗？五、你学什么外语？六、你爸爸学英语吗？七、你朋友学韩国语吗？八、今天你去商店买东西吗？',
    transcript: '1. 你工作忙吗？\n2. 你家有几口人？\n3. 今天你去银行取钱吗？\n4. 昨天你去商店吗？\n5. 你学什么外语？\n6. 你爸爸学英语吗？\n7. 你朋友学韩国语吗？\n8. 今天你去商店买东西吗？',
    questions: [
      { id: 'q7-1', type: 'audio_recording', prompt: '1. 你工作忙吗？', pinyin: 'Nǐ gōngzuò máng ma?', translationVi: 'Bạn làm việc có bận không?', targetDurationSec: 25 },
      { id: 'q7-2', type: 'audio_recording', prompt: '2. 你家有几口人？', pinyin: 'Nǐ jiā yǒu jǐ kǒu rén?', translationVi: 'Nhà bạn có mấy người?', targetDurationSec: 25 },
      { id: 'q7-3', type: 'audio_recording', prompt: '3. 今天你去银行取钱吗？', pinyin: 'Jīntiān nǐ qù yínháng qǔ qián ma?', translationVi: 'Hôm nay bạn có đi ngân hàng rút tiền không?', targetDurationSec: 25 },
      { id: 'q7-4', type: 'audio_recording', prompt: '4. 昨天你去商店吗？', pinyin: 'Zuótiān nǐ qù shāngdiàn ma?', translationVi: 'Hôm qua bạn có đi tiệm không?', targetDurationSec: 25 },
      { id: 'q7-5', type: 'audio_recording', prompt: '5. 你学什么外语？', pinyin: 'Nǐ xué shénme wàiyǔ?', translationVi: 'Bạn học ngoại ngữ gì?', targetDurationSec: 25 },
      { id: 'q7-6', type: 'audio_recording', prompt: '6. 你爸爸学英语吗？', pinyin: 'Nǐ bàba xué yīngyǔ ma?', translationVi: 'Bố bạn có học tiếng Anh không?', targetDurationSec: 25 },
      { id: 'q7-7', type: 'audio_recording', prompt: '7. 你朋友学韩国语吗？', pinyin: 'Nǐ péngyou xué hánguóyǔ ma?', translationVi: 'Bạn của bạn có học tiếng Hàn không?', targetDurationSec: 25 },
      { id: 'q7-8', type: 'audio_recording', prompt: '8. 今天你去商店买东西吗？', pinyin: 'Jīntiān nǐ qù shāngdiàn mǎi dōngxi ma?', translationVi: 'Hôm nay bạn có đi cửa hàng mua sắm không?', targetDurationSec: 25 }
    ]
  },
  {
    id: 'ex-student-8',
    assignedStudentId: 'std-8',
    title: 'Bài tập 8: Luyện nghe & Thu âm trả lời (Trần Tuấn Hào 陈俊浩)',
    description: 'Hỏi về mệt, siêu thị, trung tâm mua sắm, độ khó của tiếng Hán - tiếng Anh và gửi thư bưu điện.',
    level: 'Sơ cấp (A1-A2)',
    topic: 'Tiếng Trung giao tiếp',
    language: 'zh',
    audioSourceType: 'tts',
    durationSeconds: 40,
    createdAt: '2026-03-30',
    createdBy: 'Giáo viên Tiếng Trung',
    vocabularyHints: [
      { word: '邮局 (yóujú)', phonetic: 'yóujú', meaning: 'Bưu điện' },
      { word: '寄信 (jì xìn)', phonetic: 'jì xìn', meaning: 'Gửi thư' }
    ],
    ttsScript: '一、你累吗？二、昨天你去哪儿？三、明天你去超市吗？四、今天你妈妈去购物中心吗？五、汉语难吗？六、英语难吗？七、明天你去哪儿？八、明天你去邮局寄信吗？',
    transcript: '1. 你累吗？\n2. 昨天你去哪儿？\n3. 明天你去超市吗？\n4. 今天你妈妈去购物中心吗？\n5. 汉语难吗？\n6. 英语难吗？\n7. 明天你去哪儿？\n8. 明天你去邮局寄信吗？',
    questions: [
      { id: 'q8-1', type: 'audio_recording', prompt: '1. 你累吗？', pinyin: 'Nǐ lèi ma?', translationVi: 'Bạn có mệt không?', targetDurationSec: 25 },
      { id: 'q8-2', type: 'audio_recording', prompt: '2. 昨天你去哪儿？', pinyin: 'Zuótiān nǐ qù nǎr?', translationVi: 'Hôm qua bạn đi đâu?', targetDurationSec: 25 },
      { id: 'q8-3', type: 'audio_recording', prompt: '3. 明天你去超市吗？', pinyin: 'Míngtiān nǐ qù chāoshì ma?', translationVi: 'Ngày mai bạn có đi siêu thị không?', targetDurationSec: 25 },
      { id: 'q8-4', type: 'audio_recording', prompt: '4. 今天你妈妈去购物中心吗？', pinyin: 'Jīntiān nǐ māma qù gòuwù zhōngxīn ma?', translationVi: 'Hôm nay mẹ bạn có đi mua sắm không?', targetDurationSec: 25 },
      { id: 'q8-5', type: 'audio_recording', prompt: '5. 汉语难吗？', pinyin: 'Hànyǔ nán ma?', translationVi: 'Tiếng Hán có khó không?', targetDurationSec: 25 },
      { id: 'q8-6', type: 'audio_recording', prompt: '6. 英语难吗？', pinyin: 'Yīngyǔ nán ma?', translationVi: 'Tiếng Anh có khó không?', targetDurationSec: 25 },
      { id: 'q8-7', type: 'audio_recording', prompt: '7. 明天你去哪儿？', pinyin: 'Míngtiān nǐ qù nǎr?', translationVi: 'Ngày mai bạn đi đâu?', targetDurationSec: 25 },
      { id: 'q8-8', type: 'audio_recording', prompt: '8. 明天你去邮局寄信吗？', pinyin: 'Míngtiān nǐ qù yóujú jì xìn ma?', translationVi: 'Ngày mai bạn có đi bưu điện gửi thư không?', targetDurationSec: 25 }
    ]
  },
  {
    id: 'ex-student-9',
    assignedStudentId: 'std-9',
    title: 'Bài tập 9: Luyện nghe & Thu âm trả lời (Nguyễn Lê Bảo Ngọc 阮黎宝玉)',
    description: 'Hỏi bận rộn, người trong nhà, trung tâm tiếng Hán, mẹ học tiếng Nhật và siêu thị.',
    level: 'Sơ cấp (A1-A2)',
    topic: 'Tiếng Trung giao tiếp',
    language: 'zh',
    audioSourceType: 'tts',
    durationSeconds: 40,
    createdAt: '2026-03-30',
    createdBy: 'Giáo viên Tiếng Trung',
    vocabularyHints: [
      { word: '汉语中心 (hànyǔ zhōngxīn)', phonetic: 'hànyǔ zhōngxīn', meaning: 'Trung tâm tiếng Hán' }
    ],
    ttsScript: '一、你工作忙吗？二、你家有几口人？三、昨天你去商店吗？四、今天你去汉语中心学汉语吗？五、你学汉语吗？六、你妈妈学日语吗？七、今天你去哪儿？八、昨天你妈妈去超市买东西吗？',
    transcript: '1. 你工作忙吗？\n2. 你家有几口人？\n3. 昨天你去商店吗？\n4. 今天你去汉语中心学汉语吗？\n5. 你学汉语吗？\n6. 你妈妈学日语吗？\n7. 今天你去哪儿？\n8. 昨天你妈妈去超市买东西吗？',
    questions: [
      { id: 'q9-1', type: 'audio_recording', prompt: '1. 你工作忙吗？', pinyin: 'Nǐ gōngzuò máng ma?', translationVi: 'Bạn làm việc có bận không?', targetDurationSec: 25 },
      { id: 'q9-2', type: 'audio_recording', prompt: '2. 你家有几口人？', pinyin: 'Nǐ jiā yǒu jǐ kǒu rén?', translationVi: 'Nhà bạn có mấy người?', targetDurationSec: 25 },
      { id: 'q9-3', type: 'audio_recording', prompt: '3. 昨天你去商店吗？', pinyin: 'Zuótiān nǐ qù shāngdiàn ma?', translationVi: 'Hôm qua bạn có đi cửa hàng không?', targetDurationSec: 25 },
      { id: 'q9-4', type: 'audio_recording', prompt: '4. 今天你去汉语中心学汉语吗？', pinyin: 'Jīntiān nǐ qù hànyǔ zhōngxīn xué hànyǔ ma?', translationVi: 'Hôm nay bạn có đến trung tâm tiếng Hán học không?', targetDurationSec: 25 },
      { id: 'q9-5', type: 'audio_recording', prompt: '5. 你学汉语吗？', pinyin: 'Nǐ xué hànyǔ ma?', translationVi: 'Bạn có học tiếng Trung không?', targetDurationSec: 25 },
      { id: 'q9-6', type: 'audio_recording', prompt: '6. 你妈妈学日语吗？', pinyin: 'Nǐ māma xué rìyǔ ma?', translationVi: 'Mẹ bạn có học tiếng Nhật không?', targetDurationSec: 25 },
      { id: 'q9-7', type: 'audio_recording', prompt: '7. 今天你去哪儿？', pinyin: 'Jīntiān nǐ qù nǎr?', translationVi: 'Hôm nay bạn đi đâu?', targetDurationSec: 25 },
      { id: 'q9-8', type: 'audio_recording', prompt: '8. 昨天你妈妈去超市买东西吗？', pinyin: 'Zuótiān nǐ māma qù chāoshì mǎi dōngxi ma?', translationVi: 'Hôm qua mẹ bạn có đi siêu thị mua đồ không?', targetDurationSec: 25 }
    ]
  },
  {
    id: 'ex-student-10',
    assignedStudentId: 'std-10',
    title: 'Bài tập 10: Luyện nghe & Thu âm trả lời (Hoàng Minh Trí 黄明智)',
    description: 'Hỏi về rút tiền, siêu thị, trung tâm mua sắm, học ngoại ngữ, bố học tiếng Anh và bạn học tiếng Hàn.',
    level: 'Sơ cấp (A1-A2)',
    topic: 'Tiếng Trung giao tiếp',
    language: 'zh',
    audioSourceType: 'tts',
    durationSeconds: 40,
    createdAt: '2026-03-30',
    createdBy: 'Giáo viên Tiếng Trung',
    vocabularyHints: [
      { word: '银行 (yínháng)', phonetic: 'yínháng', meaning: 'Ngân hàng' },
      { word: '韩国语 (hánguóyǔ)', phonetic: 'hánguóyǔ', meaning: 'Tiếng Hàn Quốc' }
    ],
    ttsScript: '一、你累吗？二、今天你去银行取钱吗？三、明天你去超市吗？四、今天你妈妈去购物中心吗？五、你学什么外语？六、你爸爸学英语吗？七、你朋友学韩国语吗？八、明天你去哪儿？',
    transcript: '1. 你累吗？\n2. 今天你去银行取钱吗？\n3. 明天你去超市吗？\n4. 今天你妈妈去购物中心吗？\n5. 你学什么外语？\n6. 你爸爸学英语吗？\n7. 你朋友学韩国语吗？\n8. 明天你去哪儿？',
    questions: [
      { id: 'q10-1', type: 'audio_recording', prompt: '1. 你累吗？', pinyin: 'Nǐ lèi ma?', translationVi: 'Bạn có mệt không?', targetDurationSec: 25 },
      { id: 'q10-2', type: 'audio_recording', prompt: '2. 今天你去银行取钱吗？', pinyin: 'Jīntiān nǐ qù yínháng qǔ qián ma?', translationVi: 'Hôm nay bạn có đi ngân hàng rút tiền không?', targetDurationSec: 25 },
      { id: 'q10-3', type: 'audio_recording', prompt: '3. 明天你去超市吗？', pinyin: 'Míngtiān nǐ qù chāoshì ma?', translationVi: 'Ngày mai bạn có đi siêu thị không?', targetDurationSec: 25 },
      { id: 'q10-4', type: 'audio_recording', prompt: '4. 今天你妈妈去购物中心吗？', pinyin: 'Jīntiān nǐ māma qù gòuwù zhōngxīn ma?', translationVi: 'Hôm nay mẹ bạn có đi mua sắm không?', targetDurationSec: 25 },
      { id: 'q10-5', type: 'audio_recording', prompt: '5. 你学什么外语？', pinyin: 'Nǐ xué shénme wàiyǔ?', translationVi: 'Bạn học ngoại ngữ gì?', targetDurationSec: 25 },
      { id: 'q10-6', type: 'audio_recording', prompt: '6. 你爸爸学英语吗？', pinyin: 'Nǐ bàba xué yīngyǔ ma?', translationVi: 'Bố bạn có học tiếng Anh không?', targetDurationSec: 25 },
      { id: 'q10-7', type: 'audio_recording', prompt: '7. 你朋友学韩国语吗？', pinyin: 'Nǐ péngyou xué hánguóyǔ ma?', translationVi: 'Bạn của bạn có học tiếng Hàn không?', targetDurationSec: 25 },
      { id: 'q10-8', type: 'audio_recording', prompt: '8. 明天你去哪儿？', pinyin: 'Míngtiān nǐ qù nǎr?', translationVi: 'Ngày mai bạn đi đâu?', targetDurationSec: 25 }
    ]
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-std1',
    exerciseId: 'ex-student-1',
    studentId: 'std-1',
    studentName: 'Tống Vân Anh (宋云英)',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    submittedAt: '2026-03-30 08:30',
    status: 'graded',
    answers: {
      'q1-1': {
        questionId: 'q1-1',
        type: 'audio_recording',
        audioBlobId: 'rec_sample_std1_q1',
        audioDurationSec: 8,
        textAnswer: '我工作不忙。'
      },
      'q1-2': {
        questionId: 'q1-2',
        type: 'audio_recording',
        audioBlobId: 'rec_sample_std1_q2',
        audioDurationSec: 9,
        textAnswer: '昨天我去图书馆看书。'
      },
      'q1-3': {
        questionId: 'q1-3',
        type: 'audio_recording',
        audioBlobId: 'rec_sample_std1_q3',
        audioDurationSec: 7,
        textAnswer: '昨天我没去商店。'
      },
      'q1-4': {
        questionId: 'q1-4',
        type: 'audio_recording',
        audioBlobId: 'rec_sample_std1_q4',
        audioDurationSec: 8,
        textAnswer: '我学汉语。'
      },
      'q1-5': {
        questionId: 'q1-5',
        type: 'audio_recording',
        audioBlobId: 'rec_sample_std1_q5',
        audioDurationSec: 9,
        textAnswer: '我爸爸不学英语。'
      },
      'q1-6': {
        questionId: 'q1-6',
        type: 'audio_recording',
        audioBlobId: 'rec_sample_std1_q6',
        audioDurationSec: 9,
        textAnswer: '我朋友学韩国语。'
      },
      'q1-7': {
        questionId: 'q1-7',
        type: 'audio_recording',
        audioBlobId: 'rec_sample_std1_q7',
        audioDurationSec: 8,
        textAnswer: '今天我去学校。'
      },
      'q1-8': {
        questionId: 'q1-8',
        type: 'audio_recording',
        audioBlobId: 'rec_sample_std1_q8',
        audioDurationSec: 10,
        textAnswer: '明天我去邮局寄信。'
      }
    },
    grade: {
      gradedAt: '2026-03-30 09:15',
      gradedBy: 'Cô Trần Huyền (Thầy/Cô Phụ Trách)',
      totalScore: 9.3,
      rubricScores: {
        pronunciation: 9.2,
        comprehension: 9.5,
        fluency: 9.0,
        vocabulary: 9.5
      },
      feedbackText: 'Vân Anh (宋云英) phát âm thanh 1 và thanh 4 rất rõ ràng, đặc biệt từ "邮局" (yóujú) và "寄信" (jì xìn) chuẩn xác. Cô có thu âm lời nhận xét chi tiết bên dưới, em hãy bấm nghe nhé!',
      badges: ['Phát âm chuẩn xác', 'Ngữ điệu tự nhiên', 'Nói trôi chảy'],
      teacherAudioBlobId: 'teacher_voice_feedback_sub1',
      teacherAudioDurationSec: 15
    }
  },
  {
    id: 'sub-std2',
    exerciseId: 'ex-student-2',
    studentId: 'std-2',
    studentName: 'Nguyễn Việt Nhật Quang (阮越日光)',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    submittedAt: '2026-03-30 08:45',
    status: 'pending',
    answers: {
      'q2-1': {
        questionId: 'q2-1',
        type: 'audio_recording',
        audioBlobId: 'rec_sample_std2_q1',
        audioDurationSec: 8,
        textAnswer: '我不太累。'
      },
      'q2-2': {
        questionId: 'q2-2',
        type: 'audio_recording',
        audioBlobId: 'rec_sample_std2_q2',
        audioDurationSec: 10,
        textAnswer: '今天我去银行取钱。'
      },
      'q2-4': {
        questionId: 'q2-4',
        type: 'audio_recording',
        audioBlobId: 'rec_sample_std2_q4',
        audioDurationSec: 11,
        textAnswer: '汉语不太难。'
      }
    }
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-t1',
    recipientRole: 'teacher',
    title: '📥 Bài tập mới từ Nguyễn Việt Nhật Quang (阮越日光)',
    message: 'Nhật Quang vừa nộp bài thu âm Tiếng Trung cho Bài tập 2. Giáo viên có thể vào nghe và chấm điểm ngay!',
    submissionId: 'sub-std2',
    createdAt: '08:45',
    isRead: false
  },
  {
    id: 'notif-s1',
    recipientRole: 'student',
    studentId: 'std-1',
    title: '🎉 Bài tập của bạn đã được cô chấm điểm & gửi thu âm!',
    message: 'Cô Trần Huyền đã chấm Bài tập 1 của Tống Vân Anh (宋云英). Điểm: 9.3/10 kèm lời nhận xét bằng giọng nói.',
    submissionId: 'sub-std1',
    createdAt: '09:15',
    isRead: false
  }
];

export async function seedSampleAudio() {
  try {
    const studentVoiceBlob = createSampleAudioBlob('Student Chinese response audio');
    await saveAudioRecording('rec_sample_std1_q1', studentVoiceBlob);
    await saveAudioRecording('rec_sample_std1_q2', studentVoiceBlob);
    await saveAudioRecording('rec_sample_std1_q3', studentVoiceBlob);
    await saveAudioRecording('rec_sample_std1_q4', studentVoiceBlob);
    await saveAudioRecording('rec_sample_std1_q5', studentVoiceBlob);
    await saveAudioRecording('rec_sample_std1_q6', studentVoiceBlob);
    await saveAudioRecording('rec_sample_std1_q7', studentVoiceBlob);
    await saveAudioRecording('rec_sample_std1_q8', studentVoiceBlob);

    await saveAudioRecording('rec_sample_std2_q1', studentVoiceBlob);
    await saveAudioRecording('rec_sample_std2_q2', studentVoiceBlob);
    await saveAudioRecording('rec_sample_std2_q4', studentVoiceBlob);

    // Teacher's sample voice recording feedback
    const teacherVoiceBlob = createSampleAudioBlob('Teacher voice feedback comment in Chinese and Vietnamese');
    await saveAudioRecording('teacher_voice_feedback_sub1', teacherVoiceBlob);
  } catch (err) {
    console.warn('Seed audio skipped:', err);
  }
}
