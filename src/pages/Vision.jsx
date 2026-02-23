import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Sparkles, 
  Brain, 
  Shield, 
  GitCompare, 
  Users,
  Layers,
  TrendingUp,
  Rocket,
  Award,
  Zap
} from "lucide-react";

export default function Vision() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-10" dir="rtl">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Rocket className="w-12 h-12 text-blue-600" />
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            מערכת טרנספורמציה של מסמכים
          </h1>
        </div>
        <p className="text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed font-medium">
          לא OCR רגיל, לא enhancement פשוט – אלא <strong className="text-blue-600">מערכת מספר 1 בעולם</strong> ליצירת גרסאות חדשות ומודרניות של מסמכים היסטוריים וסרוקים
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Badge className="bg-blue-100 text-blue-700 px-4 py-1.5 text-base">מוכן לבית משפט</Badge>
          <Badge className="bg-emerald-100 text-emerald-700 px-4 py-1.5 text-base">99.9% דיוק</Badge>
          <Badge className="bg-violet-100 text-violet-700 px-4 py-1.5 text-base">שימור פורנזי</Badge>
        </div>
      </div>

      {/* Core Philosophy */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-900 flex items-center gap-3">
            <Target className="w-7 h-7" />
            הפילוסופיה המרכזית – למה זה שונה מכל מה שקיים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PhilosophyCard
              icon={Shield}
              title="Forensic Preservation First"
              description="כל מקור נשמר, חתום דיגיטלית, fingerprint + metadata. אפס שינוי למסמך המקורי."
              color="violet"
            />
            <PhilosophyCard
              icon={Sparkles}
              title="AI Enhancement"
              description="שיפור איכות מותאם לאזורים ספציפיים – טקסט, חתימות, דיאגרמות, כתב יד."
              color="indigo"
            />
            <PhilosophyCard
              icon={Brain}
              title="Semantic Understanding"
              description="המערכת מבינה מה כתוב, מה חשוב, מה חסר, מה סותר – לא רק OCR מכני."
              color="blue"
            />
            <PhilosophyCard
              icon={Users}
              title="Human-in-the-loop"
              description="תיקון רק של אזורים בעייתיים שה-AI לא בטוח בהם – יעיל ומדויק."
              color="amber"
            />
            <PhilosophyCard
              icon={Layers}
              title="Layered Output"
              description="6 שכבות: מקור, enhanced, OCR, JSON, annotations, trust score."
              color="emerald"
            />
            <PhilosophyCard
              icon={GitCompare}
              title="Cross-Source Verification"
              description="השוואה מול מסמכים אחרים, מסדי נתונים חיצוניים, היסטוריה."
              color="rose"
            />
          </div>
          <div className="mt-6 p-5 bg-white rounded-xl border-2 border-blue-200">
            <p className="text-base text-slate-700 leading-relaxed text-center">
              <strong className="text-blue-900">התוצאה:</strong> גרסה חדשנית ומושלמת של המסמך, מבלי לאבד אפילו פיקסל אחד מהמקור
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Killer Features */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-emerald-600" />
          <h2 className="text-3xl font-bold text-slate-900">פיצ׳רים שיעשו אותך מספר 1 בעולם</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FeatureSection
            title="Ultra-Restoration"
            icon={Sparkles}
            color="indigo"
            features={[
              "Super-resolution מותאם למסמכים (4x-8x)",
              "שחזור דיו דהוי וכתב יד לא קריא",
              "שיקום חותמות וחתימות מטושטשות",
              "תיקון קיפולים, כתמים וצללים",
              "הסרת רעשים ייעודית לטקסט",
              "ביטול סיבוב ותיקון פרספקטיבה אוטומטי"
            ]}
          />

          <FeatureSection
            title="Semantic AI"
            icon={Brain}
            color="blue"
            features={[
              "זיהוי אוטומטי: טקסט, טבלאות, חתימות, שרטוטים",
              "זיהוי סתירות וחוסרים במסמך",
              "מבנה מסמך מובנה JSON + Knowledge Graph",
              "סיווג אוטומטי לסוג מסמך (חוזה, חשבונית, תעודה)",
              "זיהוי שדות חשובים (שמות, תאריכים, סכומים)",
              "ניתוח סמנטי של תוכן המסמך"
            ]}
          />

          <FeatureSection
            title="Layered Transformation"
            icon={Layers}
            color="emerald"
            features={[
              "שכבה 1: המקור (immutable, with fingerprint)",
              "שכבה 2: Enhanced Image (AI restoration)",
              "שכבה 3: OCR Text Layer (searchable)",
              "שכבה 4: Structured JSON (entities + relationships)",
              "שכבה 5: AI Annotations + Confidence Heatmap",
              "שכבה 6: Decision / Trust Score (court-ready)"
            ]}
          />

          <FeatureSection
            title="Cross-Document Intelligence"
            icon={GitCompare}
            color="violet"
            features={[
              "השוואת מסמך מול מסמכים אחרים במאגר",
              "אינטגרציה עם מאגרי מידע חיצוניים",
              "זיהוי שינויים בהיסטוריה / גרסאות קודמות",
              "הצלבה עם רישום מקרקעין, היתרי בנייה",
              "אלרטים אוטומטיים למידע חסר או סותר",
              "ציון trust score משולב מכל המקורות"
            ]}
          />
        </div>

        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center gap-3">
              <Users className="w-6 h-6" />
              Human-in-the-Loop Feedback – הלמידה המתמדת
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border-2 border-amber-200">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-amber-700">1</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">זיהוי אוטומטי</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  AI מסמן רק אזורים עם confidence נמוך (&lt;80%) – לא את כל המסמך
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border-2 border-amber-200">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-amber-700">2</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">תיקון ממוקד</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  המשתמש מתקן רק את האזורים הבעייתיים עם הצעות AI
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border-2 border-amber-200">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-amber-700">3</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">למידה אדפטיבית</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  המערכת לומדת domain-specific ומשתפרת באופן אוטומטי
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Path to 99.9% */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardHeader>
          <CardTitle className="text-2xl text-emerald-900 flex items-center gap-3">
            <TrendingUp className="w-7 h-7" />
            איך להגיע ל-99.9% דיוק גם במסמכים גרועים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Damage-Aware Preprocessing",
                description: "זיהוי סוג הפגיעה (דהייה, כתם, blur, קיפול) ובחירת המודל המתאים לכל אזור",
                impact: "+8%"
              },
              {
                step: "2",
                title: "Multi-OCR + LLM Reasoning",
                description: "ריצה מקבילה של 3+ מנועי OCR (ABBYY, Google, Azure) + Vision LLM להצלבה",
                impact: "+12%"
              },
              {
                step: "3",
                title: "Confidence Fusion",
                description: "מעקב אחר confidence מרמת Pixel → Token → Field → Document → Trust Score",
                impact: "+10%"
              },
              {
                step: "4",
                title: "Cross-Document Validation",
                description: "בדיקה מול מסמכים נוספים, מסדי נתונים, תשריטים והיתרים",
                impact: "+6%"
              },
              {
                step: "5",
                title: "Human-in-the-Loop Targeted",
                description: "תיקון רק של אזורים בעייתיים, feeding למודל לשיפור מתמיד",
                impact: "+15%"
              },
              {
                step: "6",
                title: "Layered Output & Audit Trail",
                description: "כל דבר נשמר, כל שינוי מתועד ואימות forensic מלא",
                impact: "+9%"
              }
            ].map((strategy, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl border-2 border-emerald-200">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold text-emerald-700">{strategy.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{strategy.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{strategy.description}</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 font-bold shrink-0">
                  {strategy.impact}
                </Badge>
              </div>
            ))}

            <div className="mt-6 p-5 bg-white rounded-xl border-2 border-emerald-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-900">שיפור דיוק כולל</p>
                  <p className="text-sm text-slate-600 mt-1">מ-40% (OCR בודד) ל-99.9% (pipeline מלא)</p>
                </div>
                <div className="text-left">
                  <p className="text-5xl font-bold text-emerald-600">+60%</p>
                  <p className="text-sm text-slate-500">שיפור דיוק</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Stack */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Zap className="w-7 h-7 text-violet-600" />
            Technical Blueprint – High-Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TechStack
              title="Backend"
              items={[
                "Python + FastAPI / Node.js",
                "Async processing (Celery/Prefect)",
                "Object storage (S3/Azure)",
                "Vector DB (Weaviate/Pinecone)"
              ]}
            />
            <TechStack
              title="AI / Models"
              items={[
                "LayoutLMv3 / Donut (Layout)",
                "Real-ESRGAN / SwinIR (Restoration)",
                "Multi-OCR Fusion (3+ engines)",
                "Vision LLM (Contextual reasoning)"
              ]}
            />
            <TechStack
              title="Frontend"
              items={[
                "Viewer עם 6 שכבות",
                "Confidence heatmaps",
                "AI-assisted correction",
                "Trust score visualization"
              ]}
            />
            <TechStack
              title="Evaluation"
              items={[
                "Field-level accuracy",
                "Semantic accuracy",
                "Reconstruction fidelity",
                "Trust score reporting"
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-900 flex items-center gap-3">
            <Rocket className="w-7 h-7" />
            Next Steps – איך להיות Number 1 בעולם
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              "Build MVP: multi-OCR + enhancement + layered output",
              "Collect real-world degraded documents (legal, historical, appraisal)",
              "Add Human-in-the-loop correction & feedback loop",
              "Integrate cross-document verification",
              "Add Semantic AI & automated anomaly detection",
              "Measure Field-level + Semantic accuracy continuously",
              "Launch as PropTech / Enterprise-grade SaaS"
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border-2 border-blue-200">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-blue-700">{i + 1}</span>
                </div>
                <p className="text-sm font-medium text-slate-800">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
            <div className="flex items-center gap-4">
              <Award className="w-12 h-12 shrink-0" />
              <div>
                <p className="text-xl font-bold mb-1">המטרה: מערכת מספר 1 בעולם</p>
                <p className="text-sm opacity-90">
                  לא רק OCR או enhancement – אלא Document Transformation Engine שמשנה את התעשייה
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PhilosophyCard({ icon: Icon, title, description, color }) {
  const colors = {
    violet: "bg-violet-50 border-violet-200 text-violet-900",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-900",
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-900",
    rose: "bg-rose-50 border-rose-200 text-rose-900",
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${colors[color]} hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg ${colors[color]} ring-2 ring-offset-2 flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold mt-1">{title}</h3>
      </div>
      <p className="text-xs leading-relaxed opacity-80">{description}</p>
    </div>
  );
}

function FeatureSection({ title, icon: Icon, color, features }) {
  const colors = {
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-900",
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-900",
    violet: "bg-violet-50 border-violet-200 text-violet-900",
  };

  return (
    <Card className={`border-2 ${colors[color]}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg flex items-center gap-2 ${colors[color]}`}>
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${colors[color].includes('indigo') ? 'bg-indigo-400' : colors[color].includes('blue') ? 'bg-blue-400' : colors[color].includes('emerald') ? 'bg-emerald-400' : 'bg-violet-400'}`} />
              <span className="text-xs text-slate-700 leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function TechStack({ title, items }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b-2 border-violet-200">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
            <span className="text-xs text-slate-600 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}