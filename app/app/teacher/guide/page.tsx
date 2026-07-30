import { PenLine, FolderOpen, Users, CheckCircle2, BookOpen, KeyRound } from 'lucide-react';
import TeacherNav from '@/components/teacher/TeacherNav';
import AppFooter from '@/components/AppFooter';

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 w-6 h-6 rounded-full bg-[#3A7D44] text-white text-xs font-extrabold flex items-center justify-center">
        {n}
      </span>
      <p className="text-sm text-gray-600 leading-relaxed">{children}</p>
    </li>
  );
}

function GuideSection({
  icon,
  color,
  title,
  children,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-3xl p-1 bg-gradient-to-br ${color} shadow-md`}>
      <div className="bg-white/95 rounded-[1.35rem] p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shrink-0`}>
            {icon}
          </div>
          <h2 className="text-lg font-extrabold text-[#3A7D44]">{title}</h2>
        </div>
        <ol className="space-y-3">{children}</ol>
      </div>
    </div>
  );
}

export default function TeacherGuidePage() {
  return (
    <div className="min-h-screen gl-playful-bg px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <TeacherNav active="guide" />

        <div className="text-center space-y-1 py-2">
          <h1 className="text-2xl font-extrabold text-[#3A7D44]">How to Use GreenLeaf</h1>
          <p className="text-sm text-gray-400">5 key tasks for teachers on GreenLeaf</p>
        </div>

        <GuideSection icon={<KeyRound className="w-5 h-5" />} color="from-rose-400 to-pink-500" title="Create Student & Parent Accounts">
          <Step n={1}>
            Go to the <strong>Accounts</strong> tab, then <strong>&quot;Create Student Account&quot;</strong>: enter a display name, set a <strong>Username</strong> + <strong>Password</strong> (no email needed), choose a Level, and click <strong>Create account</strong>.
          </Step>
          <Step n={2}>
            Share the exact Username + Password with the student — they log in on the Login page using these two credentials (no email required).
          </Step>
          <Step n={3}>
            To create a parent account: use the <strong>&quot;Create Parent Account&quot;</strong> section right below, also with username + password, no email needed.
          </Step>
          <Step n={4}>
            In the <strong>&quot;Link Parent ↔ Student&quot;</strong> section: select a parent from the list, check the student(s) belonging to that parent, and click <strong>&quot;Save links&quot;</strong> — the parent will see their child(ren) in the Parent Dashboard.
          </Step>
          <Step n={5}>
            Student/parent forgot their password, name is wrong, or need to delete an account? Scroll to <strong>&quot;Manage Accounts&quot;</strong> — click the pencil icon to edit name/level, the key icon to reset password, or the trash icon to permanently delete the account (cannot be undone).
          </Step>
        </GuideSection>

        <GuideSection icon={<BookOpen className="w-5 h-5" />} color="from-sky-400 to-blue-500" title="Create Speaking Lessons">
          <Step n={1}>
            Go to the <strong>Lessons</strong> tab, select a <strong>Level</strong> from the buttons at the top, then click <strong>&quot;Create new lesson&quot;</strong>.
          </Step>
          <Step n={2}>
            Name the lesson (e.g. &quot;Unit 4 — Weather&quot;), then fill in all 3 missions: <strong>1) Words Explorer</strong> (topic + vocabulary list), <strong>2) Phonics/Sentence Builder</strong> (sentences for students to read along, optionally specify sounds to highlight), <strong>3) Speaking Challenge</strong> (full script for students to read on their own).
          </Step>
          <Step n={3}>
            Click <strong>&quot;Create lesson&quot;</strong> — the lesson appears immediately in the list and students at that level can see it right away.
          </Step>
          <Step n={4}>
            Each level can have unlimited lessons — repeat to add more. Click the <strong>pencil icon</strong> to edit an existing lesson, or the trash icon to delete it.
          </Step>
        </GuideSection>

        <GuideSection icon={<PenLine className="w-5 h-5" />} color="from-emerald-400 to-green-500" title="Assign & Grade Writing Homework">
          <Step n={1}>
            Go to the <strong>Homework</strong> tab. If the topic library is empty, click <strong>&quot;Create new topic&quot;</strong> in the <strong>Topic Library</strong> section below: select a Level, enter a Title + Prompt, and click <strong>&quot;Add to library&quot;</strong>. Topics only need to be created once and can be reused for multiple assignments.
          </Step>
          <Step n={2}>
            In the <strong>&quot;Assign Homework&quot;</strong> section at the top: select a topic from the library (dropdown), set a due date (optional), and click <strong>Assign</strong> — only students at the matching level will see the assignment.
          </Step>
          <Step n={3}>
            The assignment appears in the list. Click on it to see which students have submitted.
          </Step>
          <Step n={4}>
            Read the student&apos;s submission, grade externally if needed, then click <strong>&quot;Mark as graded&quot;</strong> — the status changes from <em>Submitted</em> to <em>Graded</em>, and the student will see the update.
          </Step>
        </GuideSection>

        <GuideSection icon={<FolderOpen className="w-5 h-5" />} color="from-amber-400 to-orange-500" title="Manage Resources (Resource Library)">
          <Step n={1}>
            Go to the <strong>Resource Library</strong> tab and select a sub-course: <strong>Ready Steady Grow / Think / Prepare / IELTS</strong>.
          </Step>
          <Step n={2}>
            Select an existing Unit to open it, or type a new Unit name (e.g. &quot;Unit 1&quot;) in the <strong>&quot;Create new Unit + upload first file&quot;</strong> field.
          </Step>
          <Step n={3}>
            Choose the file type (Lesson Plan / Worksheet / Flashcard / Audio / Video / Test / Keys) from the dropdown, then click <strong>&quot;Choose file&quot;</strong> to upload — you can upload multiple file types into the same Unit.
          </Step>
          <Step n={4}>
            Within a Unit, files are grouped by type. Click a file name to download it (opens in a new tab).
          </Step>
        </GuideSection>

        <GuideSection icon={<Users className="w-5 h-5" />} color="from-violet-400 to-purple-500" title="Track Students">
          <Step n={1}>
            Go to the <strong>Students</strong> tab to see all students, their levels, accumulated <strong>Leaves</strong>, and <strong>streak</strong> (consecutive study days).
          </Step>
          <Step n={2}>
            Click on a student to view their <strong>detailed learning history</strong>: Speaking practice attempts per day, scores + results (pass/fail) for every attempt (not just the latest), and a list of submitted Writing assignments.
          </Step>
        </GuideSection>

        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#3A7D44] font-extrabold text-sm">
            <CheckCircle2 className="w-4 h-4" /> Quick Notes
          </div>
          <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
            <li>Students only see assignments and resources matching their registered level.</li>
            <li>To log out or switch accounts: click <strong>Log out</strong> in the top-right corner.</li>
            <li>Click your display name (top-right) to go to your Profile and change your display name — this works for all roles.</li>
            <li>
              Issues with student recording or pronunciation scoring? That is a student-side feature (Speaking missions) powered by Azure Speech — report it to the admin if students flag errors.
            </li>
            <li>
              First-time students automatically see a short onboarding guide (5 steps) when they open the main page. They can revisit it anytime by clicking the <strong>?</strong> icon in the top-right corner of the student main page.
            </li>
          </ul>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
