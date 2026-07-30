import { BookOpen, Mic, CheckCircle2, Leaf, PenLine, TreePine } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import FloatingDecor from '@/components/decor/FloatingDecor';
import SceneBackground from '@/components/decor/SceneBackground';

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

export default function StudentHelpPage() {
  return (
    <div className="relative min-h-screen gl-playful-bg px-4 py-8">
      <SceneBackground />
      <FloatingDecor />
      <div className="relative max-w-2xl mx-auto space-y-6">
        <AppHeader backHref="/grades" icon="❓" title="How to Use" />

        <div className="text-center space-y-1 py-2">
          <p className="text-sm text-gray-400">Read this guide to learn how to practice on GreenLeaf!</p>
        </div>

        <GuideSection icon={<BookOpen className="w-5 h-5" />} color="from-sky-400 to-blue-500" title="🏠 What's on the home page?">
          <Step n={1}>
            {"Every time you open the app, you'll see your list of "}<strong>lessons</strong>{" right away (no need to pick a level again)."}
          </Step>
          <Step n={2}>
            Tap a lesson (the card with the lesson name, e.g. &quot;Lesson 1: Animals&quot;) to start practicing.
          </Step>
          <Step n={3}>
            {"A lesson with a "}<strong>green ✓</strong>{" means you've already completed it — you can still redo it for extra practice."}
          </Step>
        </GuideSection>

        <GuideSection icon={<CheckCircle2 className="w-5 h-5" />} color="from-violet-400 to-purple-500" title="🎯 Each lesson has 3 parts">
          <Step n={1}>
            <strong>Words Explorer</strong> — learn new words: listen, see the meaning, then record yourself saying each word.
          </Step>
          <Step n={2}>
            <strong>Phonics</strong> — read along sentence by sentence.
          </Step>
          <Step n={3}>
            <strong>Speaking Challenge</strong> — read the whole passage in one go.
          </Step>
          <Step n={4}>
            You must <strong>pass</strong> Part 1 to unlock Part 2, and pass Part 2 to unlock Part 3 — complete them in order, no skipping.
          </Step>
        </GuideSection>

        <GuideSection icon={<Mic className="w-5 h-5" />} color="from-teal-500 to-cyan-600" title="🎤 How to record">
          <Step n={1}>
            Tap the green <strong>&quot;Record&quot;</strong> button, then read the word or sentence on screen out loud and clearly.
          </Step>
          <Step n={2}>
            {"Tap the red "}<strong>&quot;Stop&quot;</strong>{" button when you're done (the app also auto-stops after 20 seconds if you forget)."}
          </Step>
          <Step n={3}>
            Wait a few seconds — the app will score your pronunciation.
          </Step>
        </GuideSection>

        <GuideSection icon={<Leaf className="w-5 h-5" />} color="from-emerald-400 to-green-500" title="✅ Results after reading">
          <Step n={1}>
            {"Score "}<strong>80 or above</strong>{": you'll see a green \"Well done!\" message, earn Leaves 🍃, and can move on."}
          </Step>
          <Step n={2}>
            {"Score below 80: you'll see an orange \"Try again!\" with tips on how to improve — you can retry as many times as you like!"}
          </Step>
        </GuideSection>

        <GuideSection icon={<TreePine className="w-5 h-5" />} color="from-amber-400 to-orange-500" title="🍃🔥 Leaves & streaks">
          <Step n={1}>
            Each passing attempt earns <strong>+1 Leaf 🍃</strong>. A perfect 100 earns bonus Leaves. Finishing all 3 parts of a lesson earns even more!
          </Step>
          <Step n={2}>
            Practice every day to keep your <strong>learning streak 🔥</strong> — miss a day and it resets to zero.
          </Step>
          <Step n={3}>
            Bring your Leaves to the academy to redeem prizes!
          </Step>
        </GuideSection>

        <GuideSection icon={<PenLine className="w-5 h-5" />} color="from-rose-400 to-pink-500" title="📝🌳 Writing homework & Learning Journey">
          <Step n={1}>
            Tap <strong>&quot;Homework&quot;</strong> on the home page to see writing assignments from your teacher, type your answer, and submit.
          </Step>
          <Step n={2}>
            Tap <strong>&quot;Learning Journey&quot;</strong> to see how much your tree has grown — the more you learn, the bigger it gets!
          </Step>
        </GuideSection>

        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <p className="text-sm text-gray-500">Still have questions? Ask your teacher for help! 💚</p>
        </div>
      </div>
    </div>
  );
}
