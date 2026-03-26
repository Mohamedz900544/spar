const fs = require('fs');
const path = require('path');

const arPath = path.resolve('src/locales/ar.json');
const enPath = path.resolve('src/locales/en.json');

const ar = JSON.parse(fs.readFileSync(arPath));
const en = JSON.parse(fs.readFileSync(enPath));

const faqs = [
    {
        enQ: "What exactly will my child learn at Sparvi Lab?",
        enA: "Your child will learn the skills that make technology easier to understand long-term, not just one tool for a short time. We build strong foundations in problem-solving, logical reasoning, creativity, and learning agility, then apply them through hands-on learning across computational thinking, creative coding, electronics and robotics, game development, and early AI concepts. The goal is a child who can face new challenges confidently and learn new technologies faster.",
        arQ: "ما الذي سيتعلمه طفلي بالتحديد في سبارفي لاب؟",
        arA: "سيتعلم طفلك المهارات التي تجعل فهم التكنولوجيا أسهل على المدى الطويل. نحن نبني أسسًا قوية في حل المشكلات والمنطق الإبداعي والمرونة في التعلم، ثم نطبقها من خلال التعلم العملي في التفكير الحسابي، والبرمجة الإبداعية، والإلكترونيات والروبوتات، وتطوير الألعاب، ومفاهيم الذكاء الاصطناعي المبكرة."
    },
    {
        enQ: "What age groups do you offer, and how are levels decided?",
        enA: "Sparvi Lab is designed for ages 6–17. Students are placed into age bands with a progressive curriculum that grows year by year. Placement is based on age and a simple onboarding check to understand the child's current level, attention span, and comfort with problem-solving. If a child is advanced, we can place them higher. If they need stronger foundations, we start from the right step without pressure.",
        arQ: "ما هي الفئات العمرية المتوفرة، وكيف يتم تحديد المستويات؟",
        arA: "تم تصميم سبارفي لاب للأعمار من 6 إلى 17 عامًا. يتم وضع الطلاب في مجموعات عمرية مع منهج تقدمي ينمو عامًا بعد عام. يعتمد التحديد على العمر وتقييم بسيط لفهم مستوى الطفل وانتباهه وراحته في حل المشكلات."
    },
    {
        enQ: "Do students need any prior coding or robotics experience?",
        enA: "No. Prior experience is not required. Many students join with zero background and start from the foundations. We teach concepts in an age-appropriate way that is designed for beginners. If your child already has experience, we do not repeat basics blindly. We challenge them with deeper tasks and more advanced projects.",
        arQ: "هل يحتاج الطلاب إلى أي خبرة سابقة في البرمجة أو الروبوتات؟",
        arA: "لا، الخبرة السابقة ليست مطلوبة. العديد من الطلاب ينضمون بدون أي خلفية ويبدأون من الأساسيات. نعلم المفاهيم بطريقة مناسبة للفئة العمرية ومصممة للمبتدئين."
    },
    {
        enQ: "Do parents need to attend or help during sessions?",
        enA: "In most cases, parents do not need to sit next to the child during the session. Sessions are guided and structured, and we teach children to think independently. For ages 6–8, we recommend light support at the beginning (mainly for setup and focus). After that, we gradually reduce dependence so the child builds confidence and ownership. We also run parent guidance sessions so you know how to support your child without doing the work for them.",
        arQ: "هل يجب على الآباء الحضور أو المساعدة أثناء الجلسات؟",
        arA: "في معظم الحالات، لا يحتاج الآباء للجلوس بجوار أطفالهم أثناء الجلسة. الجلسات موجهة ومنظمة، ونحن نعلم الأطفال التفكير بشكل مستقل. بالنسبة للأعمار من 6-8، نوصي بدعم خفيف في البداية لتجهيز الجلسة."
    },
    {
        enQ: "What happens if we miss a live class?",
        enA: "If you miss a session, your child will not be left behind. We provide a clear catch-up plan based on what was missed. Depending on the program, you may receive a session recording or a guided summary with tasks to complete. If needed, we also offer support time to help the student catch up and rejoin confidently.",
        arQ: "ماذا يحدث إذا فوتنا فصلًا مباشرًا؟",
        arA: "إذا فوتت جلسة، فلن يتخلف طفلك عن الركب. نحن نقدم خطة تعويض واضحة بناءً على ما تم تفويته. قد تتلقى تسجيلاً للجلسة أو ملخصاً موجهاً مع مهام لإكمالها."
    },
    {
        enQ: "How do you track progress and measure improvement over time?",
        enA: "We track progress using skill-based milestones, not just completed lessons. We focus on how the child is improving in areas such as problem-solving strategy, logical reasoning, debugging ability, creativity in solutions, and confidence during challenges. Parents receive progress updates that highlight strengths and what to work on next. This makes learning measurable and shows real growth, not just finished projects.",
        arQ: "كيف تتابعون التقدم وتقيسون التحسن بمرور الوقت؟",
        arA: "نحن نتابع التقدم باستخدام معالم قائمة على المهارات، وليس فقط الدروس المكتملة. نركز على كيفية تحسن الطفل في مجالات مثل استراتيجية حل المشكلات، والمنطق، وقدرة التصحيح، والإبداع في الحلول."
    },
    {
        enQ: "Is Sparvi Lab online, in-person, or both?",
        enA: "Sparvi Lab can be delivered online and in-person depending on your location and the program schedule. Online sessions are interactive and hands-on, not passive watching. In-person sessions follow the same curriculum, with more physical collaboration. When you enroll, we confirm the available format options and schedules for your area.",
        arQ: "هل دراسة سبارفي لاب عبر الإنترنت أم حضوريًا أم كلاهما؟",
        arA: "يمكن تقديم برامج سبارفي لاب عبر الإنترنت أو حضوريًا بناءً على موقعك وجدول البرنامج. الجلسات عبر الإنترنت تفاعلية وعملية."
    },
    {
        enQ: "How are lessons taught to match different learning styles?",
        enA: "We use proven learning models such as SAVI, 4MAT, and Meier's learning phases, so every lesson includes multiple types of engagement. Students learn by building, discussing, experimenting, moving, and applying. This supports children who learn visually, practically, socially, or through exploration. It also keeps sessions active, reduces boredom, and improves understanding and retention.",
        arQ: "كيف يتم تدريس الدروس لتلائم أساليب التعلم المختلفة؟",
        arA: "نحن نستخدم نماذج تعلم معتمدة مثل SAVI و 4MAT ومراحل تعلم ماير، بحيث يتضمن كل درس طرقاً متعددة للمشاركة. يتعلم الطلاب من خلال البناء، والمناقشة، والتجربة، والتطبيق."
    },
    {
        enQ: "How do you keep kids safe and focused with technology at home?",
        enA: "We promote healthy tech habits as part of the learning journey. Students learn structured screen use, not endless screen time. We guide parents with simple routines to support focus and reduce distractions. We also design projects around purposeful creation, so the child uses technology to build and think, not just consume. If parents want extra support, we provide guidance sessions to help create a safe, balanced home setup.",
        arQ: "كيف تحافظون على أمان الأطفال وتركيزهم مع التكنولوجيا في المنزل؟",
        arA: "نحن نشجع عادات الاستخدام الصحي للتقنية كجزء من رحلة التعلم. يتعلم الطلاب الاستخدام المنظم للشاشات، وندرب الوالدين على إجراءات بسيطة لدعم التركيز."
    },
    {
        enQ: "How long is each program, and how often are sessions?",
        enA: "Programs are structured to create real progress, not quick exposure. Session length and frequency depend on the age group and track. You will receive a clear schedule before starting, including how many sessions per month and what outcomes to expect by the end. For younger ages, sessions are shorter and more activity-based. For older ages, sessions are deeper and project-heavy.",
        arQ: "ما هي مدة كل برنامج، وكم مرة تكون الجلسات؟",
        arA: "تم تصميم البرامج لإحداث تقدم حقيقي. مدة الجلسة وتكرارها يعتمد على الفئة العمرية والمسار. في الأعمار الأصغر تكون الجلسات أقصر وتعتمد على الأنشطة."
    },
    {
        enQ: "What if my child is shy or lacks confidence?",
        enA: "That is common, and it is one of the main areas we support. We use guided participation and safe challenges that gradually increase in difficulty. We encourage thinking out loud and celebrate effort and improvement, not just correct answers. Over time, children build confidence because they learn how to approach problems step by step and see themselves improving.",
        arQ: "ماذا لو كان طفلي خجولاً أو يفتقر للثقة؟",
        arA: "هذا أمر شائع، وهو أحد المجالات الرئيسية التي ندعمها. نحن نستخدم المشاركة الموجهة والتحديات الآمنة التي تزيد في الصعوبة بالتدريج لتعزيز ثقتهم."
    },
    {
        enQ: "What equipment do we need at home for online learning?",
        enA: "In most cases, you need a laptop or desktop computer and a stable internet connection. For some tracks, the electronics kit is required. We provide a short setup guide so everything is ready before the first session. If your child joins a hardware track, we also guide you through safe setup and handling.",
        arQ: "ما هي المعدات التي نحتاجها في المنزل للتعلم عبر الإنترنت؟",
        arA: "في معظم الحالات، ستحتاج إلى جهاز كمبيوتر محمول أو مكتبي واتصال ثابت بالإنترنت. لبعض المسارات يتطلب توفير عدة إلكترونيات، وسيتم توجيهك بالمتطلبات."
    },
    {
        enQ: "Can my child switch tracks later?",
        enA: "Yes, switching tracks is possible depending on the schedule and your child's readiness. We usually recommend finishing the current phase first, then switching with a clear plan. Because the curriculum is structured, we make sure the child does not miss key foundations when moving between tracks.",
        arQ: "هل يمكن لطفلي تغيير المسار لاحقًا؟",
        arA: "نعم، تغيير المسار ممكن بناءً على الجدول الزمني واستعداد طفلك. نوصي عادة بإنهاء المرحلة الحالية أولاً لضمان عدم تفويت الأساسيات."
    },
    {
        enQ: "How do you ensure the curriculum is not just random activities?",
        enA: "Every activity at Sparvi Lab is tied to a learning objective and a progression path. We do not teach random \"fun projects\" without a learning journey. Each level builds on the previous one and prepares the child for more advanced thinking and real-world relevance. That is what makes Sparvi Lab a curriculum-driven system, not a tool-based academy.",
        arQ: "كيف تضمنون أن المنهج ليس مجرد أنشطة عشوائية؟",
        arA: "كل نشاط في سبارفي لاب مرتبط بهدف تعليمي ومسار مدروس. نحن لا نعلم مجرد مسابقات ممتعة، بل مستويات تعتمد على بعضها البعض لتحقيق التفكير المتطور."
    }
];

en.landing.faqs = {};
ar.landing.faqs = {};
faqs.forEach((item, idx) => {
    en.landing.faqs[`q${idx}`] = { q: item.enQ, a: item.enA };
    ar.landing.faqs[`q${idx}`] = { q: item.arQ, a: item.arA };
});

const features = [
    { k: "live_missions", enT: "Live, Instructor-Led Missions", enD: "A Sparvi coach leads every session step by step and answers questions in real time, so no one gets stuck.", arT: "مهمات بقيادة مدربين مباشرين", arD: "مدرب من سبارفي يوجهك خطوة بخطوة في كل جلسة ويجيب على الأسئلة في الوقت الفعلي." },
    { k: "learning_journey", enT: "A Full Learning Journey", enD: "A structured curriculum for ages 6–17 that grows with your child, with clear levels and long-term progress, not random short courses.", arT: "رحلة تعليمية كاملة", arD: "منهج منهجي للأعمار من 6-17 ينمو مع طفلك مع تقدم ومستويات واضحة." },
    { k: "built_for", enT: "Built for Ages 6–17", enD: "Age-appropriate lessons that support beginners and still challenge advanced students.", arT: "صُمم للأعمار 6–17", arD: "دروس مناسبة للعمر تدعم المبتدئين وتتحدى الطلاب المتقدمين." },
    { k: "screen_time", enT: "Screen Time With a Purpose", enD: "Kids watch, then build, test, and improve hands-on projects, turning screen time into real creation.", arT: "وقت الشاشة بهدف", arD: "يشاهد الأطفال ثم يبنون ويختبرون لتحويل وقت الشاشة إلى ابتكار فعلي." },
    { k: "structured_levels", enT: "Structured Levels, Clear Progress", enD: "Students follow clear levels with measurable outcomes and unlock more advanced projects over time.", arT: "مستويات منظمة، تقدم واضح", arD: "يتبع الطلاب مستويات واضحة بنتائج قابلة للقياس للوصول لمشاريع متقدمة." },
    { k: "parent_peace", enT: "Parent Peace of Mind", enD: "Small groups, clear weekly goals, and simple updates so you always know what your child is learning.", arT: "طمأنينة الآباء", arD: "مجموعات صغيرة وأهداف أسبوعية وتقارير مستمرة تبقى على اطلاع بتقدم طفلك." }
];

en.landing.features = {};
ar.landing.features = {};
features.forEach(f => {
    en.landing.features[f.k] = { title: f.enT, text: f.enD };
    ar.landing.features[f.k] = { title: f.arT, text: f.arD };
});

const projects = [
    { k: "p1", enT: "Hand Generator", enD: "Building a generator to power a LED and electronic components", arT: "المولد اليدوي", arD: "بناء مولد لتشغيل أضواء LED وعناصر الكترونية أخرى" },
    { k: "p2", enT: "Walking Robot", enD: "Kids build a walking robot and learn new concepts like equilibrium and motor mechanics", arT: "الروبوت المتحرك", arD: "يبني الأطفال روبوت قادرا على المشي ويتعلمون التوازن والميكانيكا" },
    { k: "p3", enT: "Pacman", enD: "Pacman Escaping is an arcade style maze", arT: "باك مان", arD: "لعبة كلاسيكية لمحاكاة متاهة باك مان بذكاء" },
    { k: "p4", enT: "Real world simulation", enD: "Real-world simulation of living organisms growing from food", arT: "محاكاة العالم الطبيعي", arD: "محاكاة واقعية لنمو الكائنات الحية اعتمادًا على مصادر الغذاء" },
    { k: "p5", enT: "Bouncing Ball", enD: "A ball that moves around the screen and bounces when it hits the edges", arT: "الكرة المرتدة", arD: "كرة تتحرك على الشاشة وترتد حال اصطدامها بالحواف" },
    { k: "p6", enT: "Planet Saver", enD: "Save the earth from the aliens", arT: "منقذ الكوكب", arD: "مهمة لإنقاذ كوكب الأرض من الغزاة الفضائيين!" }
];

en.landing.studentProjects = {};
ar.landing.studentProjects = {};
projects.forEach(p => {
    en.landing.studentProjects[p.k] = { title: p.enT, desc: p.enD };
    ar.landing.studentProjects[p.k] = { title: p.arT, desc: p.arD };
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(arPath, JSON.stringify(ar, null, 2));

console.log("Locales written nicely!");
