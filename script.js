/* ============================================
   المعمار الذكي - السكربت الرئيسي
   تطوير: عامر درزي العنزي
   ============================================ */

// ============ تسجيل Service Worker للـ PWA ============
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('✅ Service Worker مسجل بنجاح:', registration.scope);
            })
            .catch((error) => {
                console.log('❌ فشل تسجيل Service Worker:', error);
            });
    });
}

// ============ تهيئة الصفحة ============
document.addEventListener('DOMContentLoaded', () => {
    initWelcomeModal();
    initMaterialCustomizer();
    initBeforeAfterSlider();
    initVoiceAIAssistant();

    // تفعيل الميزات الكبرى الجديدة
    initThemeSwitcher();
    initSunPathControls();

    // ربط تغيير المنطقة بالحاسبة مع البطاقة الجيوتقنية
    const regionSelect = document.getElementById('region');
    if (regionSelect) {
        regionSelect.addEventListener('change', (e) => {
            updateRegionalAdvisory(e.target.value);
            if (typeof calculateCost === 'function') calculateCost();
        });
        updateRegionalAdvisory(regionSelect.value || 'riyadh');
    }

    initCounters();
    initMaterialsGrid();
    initGallery();
    initFormHandler();
    initVideoModal();
    initCalendarButtons();
    initReportButton();
    initContractors();
});

// ============ نافذة الترحيب ============
function initWelcomeModal() {
    const modal = document.getElementById('welcomeModal');
    const btn = document.getElementById('welcomeBtn');

    btn.addEventListener('click', () => {
        modal.classList.add('hidden');
        // إزالة النافذة بعد انتهاء الأنيميشن
        setTimeout(() => {
            modal.style.display = 'none';
        }, 500);
    });

    // إغلاق بالضغط على أي مكان
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('welcome-overlay')) {
            modal.classList.add('hidden');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 500);
        }
    });
}

// ============ عداد الأرقام المتحركة ============
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.count);
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 30);
}

// ============ قاعدة بيانات المواد (محدثة لأسعار السوق السعودي 2026) ============
const materialsData = {
    structure: [
        { name: 'حديد تسليح', desc: 'حديد سابك / الراجحي درجة 60', price: '2,950', unit: 'طن', icon: 'fa-solid fa-bars' },
        { name: 'أسمنت بورتلاندي', desc: 'أسمنت عادي ومقاوم', price: '16.5', unit: 'كيس 50 كجم', icon: 'fa-solid fa-cube' },
        { name: 'بلوك أسمنتي معزول', desc: 'بلوك 20×20×40 معزول', price: '3.8', unit: 'حبة', icon: 'fa-solid fa-cubes' },
        { name: 'رمل ناعم مغسول', desc: 'رمل ناعم للخلطات واللياسة', price: '55', unit: 'متر مكعب', icon: 'fa-solid fa-mound' },
        { name: 'خرسانة جاهزة', desc: 'خرسانة C35 / B350 مقاومة', price: '250', unit: 'متر مكعب', icon: 'fa-solid fa-truck-ramp-box' },
        { name: 'عزل مائي وحراري', desc: 'لفائف بيتومين مع فوم بوليسترين', price: '55', unit: 'م²', icon: 'fa-solid fa-droplet-slash' }
    ],
    finish: [
        { name: 'سيراميك أرضيات', desc: 'سيراميك 60×60 نخب أول', price: '42', unit: 'م²', icon: 'fa-solid fa-square' },
        { name: 'بورسلان فاخر', desc: 'بورسلان إسباني / هندي فرز أول', price: '85', unit: 'م²', icon: 'fa-solid fa-gem' },
        { name: 'رخام طبيعي', desc: 'رخام روزا / عماني فرز أول', price: '240', unit: 'م²', icon: 'fa-solid fa-mountain' },
        { name: 'جرانيت طبيعي', desc: 'جرانيت أرضيات وواجهات', price: '210', unit: 'م²', icon: 'fa-solid fa-layer-group' },
        { name: 'دهانات جوتن / الجزيرة', desc: 'دهان جوتن فينوماستيك نص لمعة', price: '320', unit: 'برميل 18L', icon: 'fa-solid fa-paint-roller' },
        { name: 'جبس بورد أسقف', desc: 'ألواح جبسية شاملة التوريد والتركيب', price: '55', unit: 'م²', icon: 'fa-solid fa-expand' }
    ],
    doors: [
        { name: 'باب خشب رئيسي', desc: 'خشب زان طبيعي مقوى', price: '2,800', unit: 'حبة', icon: 'fa-solid fa-door-closed' },
        { name: 'باب غرف داخلي', desc: 'خشب HDF مع الإطار والمقبض', price: '750', unit: 'حبة', icon: 'fa-solid fa-door-open' },
        { name: 'نافذة ألومنيوم', desc: 'ألومنيوم دبل جلاس سرايا', price: '550', unit: 'م²', icon: 'fa-solid fa-window-maximize' },
        { name: 'باب حديد ليزر', desc: 'حديد مشغول ليزر للحوش', price: '1,800', unit: 'م²', icon: 'fa-solid fa-window-restore' },
        { name: 'شتر كهربائي', desc: 'شتر ألومنيوم مع محرك سومفي', price: '850', unit: 'م²', icon: 'fa-solid fa-blinds' },
        { name: 'باب ذكي', desc: 'قفل ذكي بصمة وكارت ورمز', price: '1,800', unit: 'حبة', icon: 'fa-solid fa-fingerprint' }
    ],
    plumbing: [
        { name: 'خزان مياه علوي', desc: 'خزان الزامل 4 طبقات 2000L', price: '1,100', unit: 'حبة', icon: 'fa-solid fa-droplet' },
        { name: 'سخان مياه الخزف', desc: 'سخان كهربائي 50 لتر', price: '420', unit: 'حبة', icon: 'fa-solid fa-temperature-high' },
        { name: 'مغسلة حمام مودرن', desc: 'مغسلة رخام صناعي مع الخلاط', price: '550', unit: 'طقم', icon: 'fa-solid fa-sink' },
        { name: 'كرسي حمام معلق', desc: 'كرسي أفرنجي جروهي معلق', price: '850', unit: 'حبة', icon: 'fa-solid fa-toilet' },
        { name: 'بانيو / دش مطري', desc: 'طقم شاور مع خلاط مخفي', price: '1,200', unit: 'طقم', icon: 'fa-solid fa-bath' },
        { name: 'مضخة مياه اتوماتيك', desc: 'مضخة سكالا 2 إيطالية', price: '1,450', unit: 'حبة', icon: 'fa-solid fa-faucet-drip' }
    ],
    electrical: [
        { name: 'لوحة توزيع كهرباء', desc: 'لوحة 24 خط الفنار / شنايدر', price: '850', unit: 'حبة', icon: 'fa-solid fa-table-cells' },
        { name: 'أسلاك كهرباء', desc: 'أسلاك نحاس الفنار 2.5 مم', price: '2.8', unit: 'متر', icon: 'fa-solid fa-plug-circle-bolt' },
        { name: 'مفتاح ذكي WiFi', desc: 'مفتاح تويا سمارت 3 أزرار', price: '110', unit: 'حبة', icon: 'fa-solid fa-toggle-on' },
        { name: 'سبوت لايت LED', desc: 'سبوت ضد الوهج 7-12 واط', price: '28', unit: 'حبة', icon: 'fa-solid fa-lightbulb' },
        { name: 'ثريا مودرن', desc: 'ثريا مودرن للصالة والمجلس', price: '1,200', unit: 'حبة', icon: 'fa-solid fa-chandelier' },
        { name: 'نظام طاقة شمسية', desc: 'نظام 5 كيلو واط شبكي', price: '22,000', unit: 'نظام كامل', icon: 'fa-solid fa-solar-panel' }
    ]
};

function initMaterialsGrid() {
    const grid = document.getElementById('materialsGrid');
    const tabs = document.querySelectorAll('.mat-tab');

    // عرض الفئة الأولى
    displayMaterials('structure');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            displayMaterials(tab.dataset.category);
        });
    });
}

function displayMaterials(category) {
    const grid = document.getElementById('materialsGrid');
    const materials = materialsData[category];

    grid.innerHTML = '';

    materials.forEach((mat, index) => {
        const card = document.createElement('div');
        card.className = 'material-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="mat-icon"><i class="${mat.icon}"></i></div>
            <h4>${mat.name}</h4>
            <p>${mat.desc}</p>
            <div class="price">
                <span class="price-value">${mat.price} ر.س</span>
                <span class="unit">${mat.unit}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ============ معرض الصور الذكي بأنماط معمارية واقعية متكاملة ============
const galleryStylesData = {
    modern: {
        title: "النمط العصري الحديث",
        desc: "واجهات زجاجية بانورامية، خطوط معمارية جريئة، تكسيات رخام ترافنتينو، وكاسرات شمس خشبية ذكية.",
        rooms: {
            exterior: [
                { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200', label: 'واجهة فيلا عصرية بانورامية مودرن' },
                { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200', label: 'مدخل فيلا مودرن مع مسبح وزجاج' },
                { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', label: 'فيلا عصرية بإضاءة ليلية سينمائية' }
            ],
            living: [
                { url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200', label: 'صالة استقبال عصرية مفتوحة واسعة' },
                { url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200', label: 'صالون معيشة مودرن بإطلالة خارجية' },
                { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200', label: 'مجلس عصري بتشطيبات رخامية أنيقة' }
            ],
            bedroom: [
                { url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200', label: 'جناح نوم رئيسي ماستر مودرن' },
                { url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200', label: 'غرفة نوم عصرية بإضاءة دافئة' },
                { url: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=1200', label: 'تصميم فندقي معاصر لغرفة النوم' }
            ],
            kitchen: [
                { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200', label: 'مطبخ رخامي مفتوح بجزيرة وسطية' },
                { url: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=1200', label: 'مطبخ ألماني مدمج بأحدث الأجهزة' },
                { url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200', label: 'مطبخ عصري بتشطيب خشب وتيتانيوم' }
            ],
            bathroom: [
                { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200', label: 'حمام ماستر رخامي مودرن' },
                { url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200', label: 'شاور زجاجي مع مغاسل رخام عائمة' },
                { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200', label: 'حمام عصري بإضاءات LED مخفية' }
            ]
        }
    },
    classic: {
        title: "النمط الكلاسيكي الفاخر",
        desc: "أعمدة حجرية رومانية، كورنيشات جبسية بارزة، ثريات كريستال ملكية، وفخامة لا تزول مع الزمن.",
        rooms: {
            exterior: [
                { url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200', label: 'قصر كلاسيكي بأعمدة رومانية مهيبة' },
                { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200', label: 'فيلا نيوكلاسيك فخمة بحدائق ملكية' },
                { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200', label: 'واجهة قصر نيوكلاسيك بنقوش حجرية' }
            ],
            living: [
                { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200', label: 'صالون ومجلس ملكي بثريات كريستال' },
                { url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200', label: 'مجلس ضيوف كلاسيكي بأثاث فرنسي فاخر' },
                { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200', label: 'قاعة استقبال نيوكلاسيك بأعمدة داخلية' }
            ],
            bedroom: [
                { url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200', label: 'جناح نوم كلاسيكي ملكي بسرير كابوتونيه' },
                { url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200', label: 'غرفة نوم فخمة بلمسات ونقوش مذهبة' },
                { url: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1200', label: 'غرفة نوم كلاسيكية بأثاث محفور وأقمشة حرير' }
            ],
            kitchen: [
                { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200', label: 'مطبخ كلاسيكي فاخر بدواليب خشبية ملكية' },
                { url: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=1200', label: 'مطبخ نيوكلاسيك برخام إيطالي فخم' },
                { url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200', label: 'مطبخ عاجي كلاسيكي بكورنيشات بارزة' }
            ],
            bathroom: [
                { url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200', label: 'حمام ملكي كلاسيكي برخام وجاكوزي' },
                { url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1200', label: 'حمام نيوكلاسيك بتشطيبات وإكسسوارات ذهبية' },
                { url: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=1200', label: 'مغاسل ضيوف كلاسيكية بمرايا محفورة' }
            ]
        }
    },
    minimalist: {
        title: "النمط المينيمال النقي",
        desc: "خطوط نقية مستقيمة، خرسانة مكشوفة، ألوان ترابية وهادئة، وبساطة هندسية تحقق أقصى راحة نفسية.",
        rooms: {
            exterior: [
                { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200', label: 'فيلا مينيمال بكتل هندسية نقية' },
                { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200', label: 'واجهة مينيمال ناصعة البياض بدون زوائد' },
                { url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200', label: 'تصميم مينيمال بفتحات طولية مدروسة' }
            ],
            living: [
                { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200', label: 'صالة مينيمال يابانية بألوان هادئة وطبيعية' },
                { url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200', label: 'فضاء معيشة مفتوح وبسيط خالي من الزحام' },
                { url: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1200', label: 'جلسة مينيمال بضوء طبيعي نقي وأثاث مدروس' }
            ],
            bedroom: [
                { url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200', label: 'غرفة نوم مينيمال بسرير منخفض هادئ' },
                { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200', label: 'جناح مينيمال بخزائن مخفية وخشب ناعم' },
                { url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200', label: 'غرفة نوم إسكندنافية نقية ومريحة للبصر' }
            ],
            kitchen: [
                { url: 'https://images.unsplash.com/photo-1556911073-38141963c9e0?w=1200', label: 'مطبخ مينيمال مخفي بدون مقابض (Handle-less)' },
                { url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200', label: 'مطبخ مينيمال بأسطح نقية مات بدون لمعان' },
                { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200', label: 'جزيرة مطبخ مينيمال بكتلة حجرية واحدة' }
            ],
            bathroom: [
                { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200', label: 'حمام مينيمال مايكروسيمنت بدون فواصل' },
                { url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200', label: 'دش مينيمال جداري مدفون بمظهر نقي' },
                { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200', label: 'حمام بتصميم انسيابي مهدئ للأعصاب' }
            ]
        }
    },
    arabic: {
        title: "النمط العربي التراثي / الطراز السلماني",
        desc: "مستوحى من عمارة نجد والتراث السعودي الأصيل؛ حجر الرياض، المشربيات، المجالس الفسيحة، والمشبات التراثية.",
        rooms: {
            exterior: [
                { url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200', label: 'واجهة فيلا سلمانية نجدية بحجر الرياض وشرفات تراثية' },
                { url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200', label: 'قصر بطراز عربي أندلسي وأقواس معمارية أصيلة' },
                { url: 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=1200', label: 'مدخل تراثي سعودي بباب خشبي منقوش وفوانيس نحاسية' }
            ],
            living: [
                { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200', label: 'مجلس عربي سعودي أصيل بمشب وجلسة فاخرة' },
                { url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200', label: 'ديوانية عربية فخمة بنقوش وزخارف إسلامية' },
                { url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200', label: 'مجلس ضيوف بنقوش جبسية نجدية وسجاد يدوي فاخر' }
            ],
            bedroom: [
                { url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200', label: 'جناح نوم بطابع شرقي دافئ وأقواس عربية ناعمة' },
                { url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200', label: 'غرفة نوم بنقوش خشبية تراثية وإضاءات فانوسية دافئة' },
                { url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200', label: 'غرفة نوم شرقية حديثة تمزج الأصالة بالحداثة' }
            ],
            kitchen: [
                { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200', label: 'مطبخ دافئ بتطعيمات خشب الأثل وحجر الرياض' },
                { url: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=1200', label: 'مطبخ شرقي واسع مهيأ للضيافة والولائم' },
                { url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200', label: 'مطبخ عربي بلمسات خشبية تراثية ورفوف فخارية' }
            ],
            bathroom: [
                { url: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=1200', label: 'مغاسل ضيوف بتصميم أندلسي ومغاسل نحاسية منقوشة' },
                { url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200', label: 'حمام بطراز الحمام الشرقي الفاخر برخام دافئ' },
                { url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=1200', label: 'مغاسل مجالس بنقوش هندسية إسلامية أنيقة' }
            ]
        }
    }
};

let currentGalleryStyle = 'modern';
let currentGalleryRoom = 'exterior';

function initGallery() {
    const navBtns = document.querySelectorAll('.gallery-nav-btn');
    const styleSelect = document.getElementById('designStyle');

    // استماع لتغيير نمط التصميم
    if (styleSelect) {
        styleSelect.addEventListener('change', (e) => {
            currentGalleryStyle = e.target.value;
            updateStyleBanner();
            updateGallery(currentGalleryRoom);
        });
    }

    // استماع لأزرار التنقل بين الغرف
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentGalleryRoom = btn.dataset.room;
            updateGallery(currentGalleryRoom);
        });
    });

    // العرض الأولي
    updateStyleBanner();
    updateGallery('exterior');
}

function updateStyleBanner() {
    const styleData = galleryStylesData[currentGalleryStyle] || galleryStylesData.modern;
    const tagEl = document.getElementById('styleBadgeTag');
    const descEl = document.getElementById('styleBadgeDesc');

    if (tagEl) tagEl.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> ${styleData.title}`;
    if (descEl) descEl.textContent = styleData.desc;
}

function updateGallery(room) {
    const styleData = galleryStylesData[currentGalleryStyle] || galleryStylesData.modern;
    const images = styleData.rooms[room] || styleData.rooms.exterior;

    const mainImg = document.getElementById('mainGalleryImg');
    const label = document.getElementById('imageLabel');
    const thumbRow = document.getElementById('thumbnailRow');

    if (!mainImg || !label || !thumbRow) return;

    // تحديث الصورة الرئيسية مع تأثير ناعم
    mainImg.style.opacity = 0;
    setTimeout(() => {
        mainImg.src = images[0].url;
        label.textContent = images[0].label;
        mainImg.style.opacity = 1;
    }, 250);

    // تحديث الصور المصغرة
    thumbRow.innerHTML = '';
    images.forEach((img, index) => {
        const thumb = document.createElement('img');
        thumb.src = img.url.replace('w=1200', 'w=200');
        thumb.alt = img.label;
        thumb.className = index === 0 ? 'active' : '';

        thumb.addEventListener('click', () => {
            thumbRow.querySelectorAll('img').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');

            mainImg.style.opacity = 0;
            setTimeout(() => {
                mainImg.src = img.url;
                label.textContent = img.label;
                mainImg.style.opacity = 1;
            }, 250);
        });

        thumbRow.appendChild(thumb);
    });
}


// ============ نموذج حاسبة التكلفة ============
function initFormHandler() {
    const form = document.getElementById('constructionForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateCost();
    });
}

function calculateCost() {
    // جمع البيانات
    const type = document.getElementById('buildingType').value;
    const area = parseFloat(document.getElementById('area').value);
    const floors = parseInt(document.getElementById('floors').value);
    const finish = document.getElementById('finishLevel').value;
    const region = document.getElementById('region').value;

    // الإضافات
    const hasBasement = document.getElementById('basement').checked;
    const hasPool = document.getElementById('pool').checked;
    const hasElevator = document.getElementById('elevator').checked;
    const hasSolar = document.getElementById('solar').checked;
    const hasSmartHome = document.getElementById('smartHome').checked;
    const hasGarden = document.getElementById('garden').checked;

    if (!area || area < 50) {
        alert('الرجاء إدخال مساحة صحيحة (50 م² على الأقل)');
        return;
    }

    // الأسعار الأساسية الواقعية في السوق السعودي (ريال/متر بناء مسطح)
    const baseRates = {
        villa: 1500,        // فيلا سكنية (عظم + تشطيب ديلوكس)
        duplex: 1450,       // دوبلكس
        apartment: 1350,    // شقة / عمارة سكنية
        building: 1650,     // عمارة تجارية سكنية
        commercial: 1850,   // مجمع تجاري
        warehouse: 950      // مستودع / هنجر
    };

    // معاملات التشطيب الواقعية
    const finishMultipliers = {
        economy: 0.70,     // اقتصادي (تجاري)
        standard: 1.0,      // ديلوكس (قياسي)
        luxury: 1.35,      // سوبر ديلوكس
        ultra: 1.70,       // ألترا لوكس VIP
        smart: 1.90        // منزل ذكي بالكامل
    };

    // معاملات المناطق المحدثة والواقعية بالسوق السعودي
    const regionMultipliers = {
        riyadh: 1.0,        // الرياض (المعيار الأساسي)
        hail: 0.92,         // حائل
        qassim: 0.93,       // القصيم (بريدة / عنيزة)
        jeddah: 1.04,       // جدة
        makkah: 1.08,       // مكة المكرمة
        madinah: 1.02,      // المدينة المنورة
        eastern: 0.98,      // المنطقة الشرقية والأحساء
        abha: 0.95,         // عسير وأبها وخميس مشيط
        tabuk: 0.96,        // تبوك ونيوم
        taif: 0.95,         // الطائف
        jouf: 0.91,         // الجوف والحدود الشمالية
        jazan: 0.93,        // جازان ونجران
        baha: 0.94,         // الباحة
        other: 0.94         // مناطق أخرى
    };

    // الحسابات
    const totalArea = area * floors;
    const baseRate = baseRates[type] || 1500;
    const finishMult = finishMultipliers[finish] || 1.0;
    const regionMult = regionMultipliers[region] || 1.0;

    // تكلفة العظم بالمواد (~42% من التكلفة الأساسية)
    const structureCost = Math.round(totalArea * baseRate * 0.42 * regionMult);

    // تكلفة التشطيب (~43% من التكلفة)
    const finishCost = Math.round(totalArea * baseRate * 0.43 * finishMult * regionMult);

    // تكلفة الكهرباء والسباكة والتكييف (~15%)
    const mecCost = Math.round(totalArea * baseRate * 0.15 * regionMult);

    // الإضافات بأسعار واقعية ومحدثة بالسوق السعودي
    let extrasCost = 0;
    if (hasBasement) extrasCost += area * 650;      // 650 ر.س للمتر المربع للقبو
    if (hasPool) extrasCost += 55000;              // 55,000 ر.س مسبح كامل
    if (hasElevator) extrasCost += 75000;           // 75,000 ر.س مصعد 3 وقفات كامل
    if (hasSolar) extrasCost += 22000;              // 22,000 ر.س طاقة شمسية 5KW
    if (hasSmartHome) extrasCost += 25000;          // 25,000 ر.س تأسيس سمارت هوم
    if (hasGarden) extrasCost += 20000;             // 20,000 ر.س تنسيق حوش وحديقة

    const totalCost = structureCost + finishCost + mecCost + extrasCost;

    // المدة التقديرية
    const duration = Math.ceil((totalArea / 150) + 3 + (floors * 1.5));

    // عدد العمال
    const workers = Math.ceil(totalArea / 40) + 5;

    // عرض النتائج
    document.querySelector('.results-placeholder').style.display = 'none';
    document.getElementById('resultsContent').classList.remove('hidden');

    // تحديث القيم مع أنيميشن
    animateValue('totalCost', 0, totalCost, 1500);
    document.getElementById('structureCost').textContent = structureCost.toLocaleString() + ' ر.س';
    document.getElementById('finishCost').textContent = finishCost.toLocaleString() + ' ر.س';
    document.getElementById('mecCost').textContent = mecCost.toLocaleString() + ' ر.س';
    document.getElementById('extrasCost').textContent = extrasCost.toLocaleString() + ' ر.س';
    document.getElementById('duration').textContent = duration + ' شهر';
    document.getElementById('workers').textContent = workers + ' عامل';

    // التمرير للنتائج
    document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth' });

    // حساب الكميات
    calculateQuantities(totalArea);

}

function calculateQuantities(area) {
    // معادلات محدثة (أكثر واقعية للسوق السعودي)
    // الحديد: متوسط 60-70 كجم للمتر المسطح (شامل القواعد والأعمدة والأسقف)
    const iron = (area * 65) / 1000;

    // البلوك: متوسط 40-50 بلوكة للمتر (شامل الجدران والهوردي والسور)
    const blocks = Math.ceil(area * 45);

    // الأسمنت: خرسانة + مباني + لياسة (حوالي 5-6 أكياس للمتر)
    const cement = Math.ceil(area * 5.5);

    // الرمل: للخرسانة واللياسة (0.25 متر مكعب تقريباً)
    const sand = Math.ceil(area * 0.25);

    // تحديث الواجهة
    animateValue('qtyIron', 0, iron, 1000);
    animateValue('qtyBlocks', 0, blocks, 1500);
    animateValue('qtyCement', 0, cement, 1500);
    animateValue('qtySand', 0, sand, 1000);
}

function animateValue(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    const range = end - start;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const current = Math.floor(start + range * easeProgress);
        element.textContent = current.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ============ التمرير السلس للروابط ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ============ تأثير الظهور عند التمرير ============
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// تطبيق على البطاقات والأقسام
document.querySelectorAll('.glass-card, .material-card, .tip-card, .timeline-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(el);
});

// ============ محاكي البناء ثلاثي الأبعاد 3D ============
let constructionSimulatorInstance = null;

function initVideoModal() {
    const modal = document.getElementById('videoModal');
    const btn = document.getElementById('watchJourneyBtn');
    const navBtn = document.getElementById('nav3dBtn');
    const closeBtn = document.querySelector('.close-video-btn');
    const overlay = document.querySelector('.video-overlay');

    if (!modal) return;

    const openSimulator = () => {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // تهيئة محرك 3D عند أول فتح
        if (!constructionSimulatorInstance && typeof ConstructionSimulator3D !== 'undefined') {
            setTimeout(() => {
                constructionSimulatorInstance = new ConstructionSimulator3D('canvas3dContainer');
                initSimulatorControls();
            }, 100);
        } else if (constructionSimulatorInstance) {
            setTimeout(() => {
                constructionSimulatorInstance.onWindowResize();
            }, 150);
        }
    };

    if (btn) btn.addEventListener('click', openSimulator);
    if (navBtn) navBtn.addEventListener('click', openSimulator);

    const closeModal = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        if (constructionSimulatorInstance && constructionSimulatorInstance.isAutoPlaying) {
            constructionSimulatorInstance.toggleAutoPlay();
        }
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);
}

function initSimulatorControls() {
    if (!constructionSimulatorInstance) return;

    // أزرار مراحل البناء
    const stageBtns = document.querySelectorAll('.stage-pill-btn');
    stageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const stage = parseInt(btn.getAttribute('data-stage'), 10);
            if (constructionSimulatorInstance.isAutoPlaying) {
                constructionSimulatorInstance.toggleAutoPlay();
            }
            constructionSimulatorInstance.setStage(stage);
        });
    });

    // زر التشغيل التلقائي (التايم لابس)
    const autoPlayBtn = document.getElementById('btnAutoPlay3D');
    if (autoPlayBtn) {
        autoPlayBtn.addEventListener('click', () => {
            constructionSimulatorInstance.toggleAutoPlay();
        });
    }

    // زر التبديل الليلي والنهاري
    const dayNightBtn = document.getElementById('btnDayNight3D');
    if (dayNightBtn) {
        dayNightBtn.addEventListener('click', () => {
            constructionSimulatorInstance.toggleDayNight();
        });
    }

    // زر الأشعة السينية (X-Ray)
    const xRayBtn = document.getElementById('btnXRay3D');
    if (xRayBtn) {
        xRayBtn.addEventListener('click', () => {
            constructionSimulatorInstance.toggleXRay();
        });
    }

    // أزرار زوايا الكاميرا
    const camButtons = [
        { id: 'camIsoBtn', view: 'isometric' },
        { id: 'camDroneBtn', view: 'drone' },
        { id: 'camFrontBtn', view: 'front' },
        { id: 'camPoolBtn', view: 'pool' }
    ];

    camButtons.forEach(cb => {
        const el = document.getElementById(cb.id);
        if (el) {
            el.addEventListener('click', () => {
                document.querySelectorAll('.tool-icon-btn').forEach(b => b.classList.remove('active'));
                el.classList.add('active');
                constructionSimulatorInstance.setCameraView(cb.view);
            });
        }
    });

    const resetBtn = document.getElementById('camResetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.querySelectorAll('.tool-icon-btn').forEach(b => b.classList.remove('active'));
            const iso = document.getElementById('camIsoBtn');
            if (iso) iso.classList.add('active');
            constructionSimulatorInstance.resetCamera();
        });
    }
}

// ============ تذكير التقويم ============
function initCalendarButtons() {
    const buttons = document.querySelectorAll('.btn-calendar');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const stageName = btn.dataset.stage;
            const offsetDays = parseInt(btn.dataset.offset);

            // حساب التاريخ
            const date = new Date();
            date.setDate(date.getDate() + offsetDays);

            // تنسيق التاريخ لـ Google Calendar (YYYYMMDD)
            const isoDate = date.toISOString().replace(/-|:|\.\d\d\d/g, "");
            const startDate = isoDate.substring(0, 8);
            const endDate = isoDate.substring(0, 8); // نفس اليوم

            const title = `مرحلة البناء: ${stageName}`;
            const details = `تذكير ببدء مرحلة ${stageName} من مشروع منزلك - المعمار الذكي`;

            // رابط Google Calendar
            const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}`;

            window.open(url, '_blank');
        });
    });
}

// ============ زر التقرير ============
function initReportButton() {
    const btn = document.getElementById('downloadReportBtn');
    if (btn) {
        btn.addEventListener('click', () => {
            window.print();
        });
    }
}

// ============ دليل المقاولين ============
const contractorsData = [
    { name: 'مؤسسة العمران الحديث', specialty: 'مقاول عام', rating: 4.8, reviews: 120, initial: 'ع' },
    { name: 'فني كهرباء المحترفين', specialty: 'كهربائي', rating: 4.9, reviews: 85, initial: 'ك' },
    { name: 'السباكة الذهبية', specialty: 'سباك', rating: 4.7, reviews: 92, initial: 'س' },
    { name: 'دهانات الألوان', specialty: 'دهان', rating: 4.6, reviews: 64, initial: 'د' }
];

function initContractors() {
    renderContractors();
    initJoinModal();
}

function renderContractors() {
    const grid = document.getElementById('contractorsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    contractorsData.forEach(cont => {
        const card = document.createElement('div');
        card.className = 'contractor-card glass-card';
        card.innerHTML = `
            <div class="contractor-header">
                <div class="contractor-avatar">${cont.initial}</div>
                <div class="contractor-info">
                    <h4>${cont.name}</h4>
                    <span class="specialty"><i class="fa-solid fa-briefcase"></i> ${cont.specialty}</span>
                </div>
            </div>
            <div class="contractor-body">
                <div class="rating">
                    <i class="fa-solid fa-star"></i>
                    <strong>${cont.rating}</strong>
                    <span>(${cont.reviews} تقييم)</span>
                </div>
                <button class="btn-hire" onclick="window.open('https://wa.me/966566620279?text=مرحباً، أرغب بالاستفسار عن خدماتك في منصة المعمار الذكي', '_blank')">
                    <i class="fa-brands fa-whatsapp"></i> تواصل معي
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function initJoinModal() {
    const modal = document.getElementById('contractorModal');
    const btn = document.getElementById('joinContractorBtn');
    const closeBtn = modal.querySelector('.close-modal-btn');
    const overlay = modal.querySelector('.modal-overlay');
    const form = document.getElementById('contractorForm');

    if (!btn || !modal) return;

    btn.addEventListener('click', () => modal.classList.remove('hidden'));

    const closeModal = () => modal.classList.add('hidden');
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('contName').value;
        const specialty = document.getElementById('contSpecialty').value;
        const phone = document.getElementById('contPhone').value;

        // تجهيز رسالة الواتساب
        const message = `السلام عليكم، أرغب بالانضمام كـ (${specialty}) في منصة المعمار الذكي.\n\n👤 الاسم: ${name}\n📱 رقمي: ${phone}\n\nسأقوم بإرسال شهاداتي ونماذج أعمالي للتقييم.`;

        const whatsappUrl = `https://wa.me/966566620279?text=${encodeURIComponent(message)}`;

        // فتح الواتساب
        alert('سيتم تحويلك للواتساب الآن لإرسال طلب الانضمام...\n' + message);
        window.open(whatsappUrl, '_blank');

        // إغلاق وتصفير
        closeModal();
        form.reset();
    });
}


// ============================================================
// 1. مخصّص الخامات اللحظي في المحاكي ثلاثي الأبعاد 3D
// ============================================================
function initMaterialCustomizer() {
    const paletteBtn = document.getElementById('btnMaterialPalette');
    const panel = document.getElementById('materialCustomizerPanel');
    const closeBtn = document.getElementById('closeCustomizerBtn');

    if (paletteBtn && panel) {
        paletteBtn.addEventListener('click', () => {
            panel.classList.toggle('hidden');
        });
    }

    if (closeBtn && panel) {
        closeBtn.addEventListener('click', () => {
            panel.classList.add('hidden');
        });
    }

    // تبديل رخام الواجهة
    const matBtns = document.querySelectorAll('[data-mat]');
    matBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            matBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const matType = btn.getAttribute('data-mat');
            if (window.constructionSimulatorInstance && typeof window.constructionSimulatorInstance.setFacadeCladding === 'function') {
                window.constructionSimulatorInstance.setFacadeCladding(matType);
            }
        });
    });

    // تبديل خشب الكاسرات
    const woodBtns = document.querySelectorAll('[data-wood]');
    woodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            woodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const woodType = btn.getAttribute('data-wood');
            if (window.constructionSimulatorInstance && typeof window.constructionSimulatorInstance.setWoodFinish === 'function') {
                window.constructionSimulatorInstance.setWoodFinish(woodType);
            }
        });
    });

    // تبديل إضاءة المسبح
    const poolBtns = document.querySelectorAll('[data-pool]');
    poolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            poolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const poolColor = btn.getAttribute('data-pool');
            if (window.constructionSimulatorInstance && typeof window.constructionSimulatorInstance.setPoolGlow === 'function') {
                window.constructionSimulatorInstance.setPoolGlow(poolColor);
            }
        });
    });
}

// ============================================================
// 2. شريط المقارنة التفاعلي قبل وبعد (Before & After Slider)
// ============================================================
function initBeforeAfterSlider() {
    const container = document.getElementById('baSliderContainer');
    const afterLayer = document.getElementById('baAfterLayer');
    const handle = document.getElementById('baSliderHandle');

    if (!container || !afterLayer || !handle) return;

    let isDragging = false;

    function setSliderPosition(x) {
        const rect = container.getBoundingClientRect();
        let posX = x - rect.left;
        posX = Math.max(0, Math.min(posX, rect.width));
        const percent = (posX / rect.width) * 100;

        afterLayer.style.clipPath = `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0 100%)`;
        handle.style.left = `${percent}%`;
    }

    // أحداث الماوس
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        setSliderPosition(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        setSliderPosition(e.clientX);
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // أحداث اللمس للهواتف الذكية
    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        setSliderPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        setSliderPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
        isDragging = false;
    });
}

// ============================================================
// 3. المستشار الصوتي الذكي (Voice AI Assistant)
// ============================================================
function initVoiceAIAssistant() {
    const trigger = document.getElementById('voiceAiTrigger');
    const modal = document.getElementById('voiceAiModal');
    const backdrop = document.getElementById('voiceAiBackdrop');
    const closeBtn = document.getElementById('closeVoiceAiBtn');
    const bigMicBtn = document.getElementById('bigMicBtn');
    const textInput = document.getElementById('voiceTextQuery');
    const sendBtn = document.getElementById('sendVoiceQueryBtn');
    const chatBox = document.getElementById('voiceChatBox');
    const waves = document.getElementById('voiceWaves');
    const statusText = document.getElementById('voiceAiStatus');
    const chips = document.querySelectorAll('.voice-chip');
    const muteBtn = document.getElementById('voiceMuteToggleBtn');
    const muteIcon = document.getElementById('voiceMuteIcon');
    const speedBtn = document.getElementById('voiceSpeedBtn');
    const speedLabel = document.getElementById('voiceSpeedLabel');

    if (!trigger || !modal) return;

    // حالة الصوت
    let isAudioMuted = false;
    let speechRate = 0.92; // نبرة هادئة ومتقنة ومحترمة
    const speedCycle = [0.92, 1.0, 1.15];
    let speedIndex = 0;

    // محرك الأصوات وتهيئته مبكراً
    let cachedVoices = [];
    function loadVoices() {
        if ('speechSynthesis' in window) {
            cachedVoices = window.speechSynthesis.getVoices() || [];
        }
    }
    if ('speechSynthesis' in window) {
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // فتح وإغلاق النافذة
    trigger.addEventListener('click', () => {
        modal.classList.remove('hidden');
        loadVoices();
    });

    function closeModal() {
        modal.classList.add('hidden');
        stopSpeech();
        if (recognition && isRecording) recognition.stop();
    }

    if (backdrop) backdrop.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // زر كتم / تفعيل الصوت
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            isAudioMuted = !isAudioMuted;
            if (isAudioMuted) {
                stopSpeech();
                muteBtn.classList.add('muted');
                if (muteIcon) {
                    muteIcon.className = 'fa-solid fa-volume-xmark';
                }
                muteBtn.title = 'الصوت مكتوم (انقر للتفعيل)';
            } else {
                muteBtn.classList.remove('muted');
                if (muteIcon) {
                    muteIcon.className = 'fa-solid fa-volume-high';
                }
                muteBtn.title = 'الصوت مفعل (انقر للكتم)';
            }
        });
    }

    // زر تغيير السرعة
    if (speedBtn) {
        speedBtn.addEventListener('click', () => {
            speedIndex = (speedIndex + 1) % speedCycle.length;
            speechRate = speedCycle[speedIndex];
            const labels = ['0.9x', '1.0x', '1.2x'];
            if (speedLabel) speedLabel.textContent = labels[speedIndex];
            speedBtn.title = `سرعة الصوت: ${labels[speedIndex]}`;
        });
    }

    // التعرف على الصوت بالمتصفح
    let recognition = null;
    let isRecording = false;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            isRecording = true;
            stopSpeech(); // إيقاف أي كلام أثناء استماع المايك
            bigMicBtn.classList.add('recording');
            waves.classList.add('active');
            statusText.innerHTML = '<i class="fa-solid fa-microphone-lines" style="color: #ef4444;"></i> استمع إليك الآن... تفضل بسؤالك';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            handleUserQuery(transcript);
        };

        recognition.onerror = (event) => {
            console.warn('Speech Recognition Error:', event.error);
            stopRecording();
            statusText.innerHTML = '<i class="fa-solid fa-circle"></i> جاهز للاستماع';
        };

        recognition.onend = () => {
            stopRecording();
        };
    }

    function stopRecording() {
        isRecording = false;
        if (bigMicBtn) bigMicBtn.classList.remove('recording');
        if (waves) waves.classList.remove('active');
        if (statusText) statusText.innerHTML = '<i class="fa-solid fa-circle"></i> متصل وجاهز للاستماع';
    }

    if (bigMicBtn) {
        bigMicBtn.addEventListener('click', () => {
            if (!recognition) {
                alert('التعرف الصوتي غير مدعوم في متصفحك الحالي، يمكنك كتابة سؤالك في الحقل وسأجيبك فوراً.');
                return;
            }
            if (isRecording) {
                recognition.stop();
            } else {
                try {
                    stopSpeech();
                    recognition.start();
                } catch(e) {
                    console.error(e);
                }
            }
        });
    }

    // إرسال عبر النص
    function submitTextQuery() {
        const q = textInput.value.trim();
        if (q) {
            handleUserQuery(q);
            textInput.value = '';
        }
    }

    if (sendBtn) sendBtn.addEventListener('click', submitTextQuery);
    if (textInput) {
        textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitTextQuery();
        });
    }

    // الأسئلة السريعة
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const q = chip.getAttribute('data-query');
            if (q) handleUserQuery(q);
        });
    });

    // معالجة السؤال والرد بالذكاء الاصطناعي
    function handleUserQuery(query) {
        stopSpeech();
        appendMessage(query, 'user');

        if (statusText) statusText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري تحليل السؤال هندسياً...';
        if (waves) waves.classList.add('active');

        setTimeout(() => {
            const response = generateAIResponse(query);
            appendMessage(response.displayText, 'ai', response.spokenText);
            speakArabic(response.spokenText);
        }, 650);
    }

    // إضافة فقاعة رسالة
    function appendMessage(text, sender, spokenText = '') {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${sender}-bubble`;
        const icon = (sender === 'ai') ? 'fa-robot' : 'fa-user';

        if (sender === 'ai') {
            bubble.innerHTML = `
                <div class="bubble-avatar"><i class="fa-solid ${icon}"></i></div>
                <div class="bubble-content-wrap">
                    <div class="bubble-text">${text}</div>
                    <button class="bubble-replay-btn" title="إعادة الاستماع للصوت">
                        <i class="fa-solid fa-volume-high"></i> استمع مجدداً
                    </button>
                </div>
            `;
            const replayBtn = bubble.querySelector('.bubble-replay-btn');
            if (replayBtn) {
                replayBtn.addEventListener('click', () => {
                    speakArabic(spokenText || text, replayBtn);
                });
            }
        } else {
            bubble.innerHTML = `
                <div class="bubble-avatar"><i class="fa-solid ${icon}"></i></div>
                <div class="bubble-content-wrap">
                    <div class="bubble-text">${text}</div>
                </div>
            `;
        }

        chatBox.appendChild(bubble);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // ربط زر الترحيب الافتراضي إن وجد
    const initialWelcomeReplay = chatBox.querySelector('.bubble-replay-btn');
    if (initialWelcomeReplay) {
        initialWelcomeReplay.addEventListener('click', () => {
            const spoken = initialWelcomeReplay.getAttribute('data-spoken');
            speakArabic(spoken, initialWelcomeReplay);
        });
    }

    // اختيار أفضل صوت عربي طبيعي متاح بالجهاز
    function getBestArabicVoice() {
        if (!cachedVoices || cachedVoices.length === 0) {
            loadVoices();
        }
        if (!cachedVoices || cachedVoices.length === 0) return null;

        // 1. الأصوات الطبيعية في إيدج وويندوز (Shakir, Fatima, Hamed Online Natural)
        const naturalVoice = cachedVoices.find(v => 
            (v.lang === 'ar-SA' || v.lang.startsWith('ar')) && 
            (v.name.includes('Natural') || v.name.includes('Online'))
        );
        if (naturalVoice) return naturalVoice;

        // 2. الأصوات المدمجة بالسعودية (نايف أو هدى)
        const saudiNamed = cachedVoices.find(v => 
            v.lang === 'ar-SA' && 
            (v.name.includes('Naayf') || v.name.includes('Hoda') || v.name.includes('Hamid'))
        );
        if (saudiNamed) return saudiNamed;

        // 3. أي صوت سعودي ar-SA
        const saudiVoice = cachedVoices.find(v => v.lang === 'ar-SA' || v.lang === 'ar_SA');
        if (saudiVoice) return saudiVoice;

        // 4. صوت جوجل العربي
        const googleAr = cachedVoices.find(v => 
            v.name.includes('Google') && (v.lang.startsWith('ar') || v.name.includes('العربية'))
        );
        if (googleAr) return googleAr;

        // 5. أي صوت عربي متاح
        const anyAr = cachedVoices.find(v => 
            v.lang.startsWith('ar') || v.name.toLowerCase().includes('arabic') || v.name.includes('عربي')
        );
        if (anyAr) return anyAr;

        return null;
    }

    // إيقاف الصوت الحالي
    function stopSpeech() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        if (waves) waves.classList.remove('active');
        if (statusText) statusText.innerHTML = '<i class="fa-solid fa-circle"></i> متصل وجاهز للاستماع';
        document.querySelectorAll('.bubble-replay-btn.speaking').forEach(b => b.classList.remove('speaking'));
    }

    // تهيئة النص ليكون ناعماً وسلساً في النطق دون رموز أو فواصل أرقام
    function prepareSpeechText(raw) {
        if (!raw) return '';
        let t = raw;

        // تحويل الوحدات القياسية إلى كلمات عربية فصحى سلسة
        t = t.replace(/(\d+)\s*(م²|م2)/g, '$1 متر مربع');
        t = t.replace(/(\d+)\s*م\b/g, '$1 متر');
        t = t.replace(/(\d+)\s*سم\b/g, '$1 سنتيمتر');
        t = t.replace(/(\d+)\s*ملم\b/g, '$1 مليمتر');
        t = t.replace(/(\d+)\s*كجم\/م³?/g, '$1 كيلوجرام لكل متر مكعب');
        t = t.replace(/(\d+)\s*كجم\b/g, '$1 كيلوجرام');
        t = t.replace(/(\d+)\s*[x×*]\s*(\d+)/g, '$1 في $2');
        t = t.replace(/SBC/gi, 'كود البناء السعودي');
        t = t.replace(/LED/gi, 'ليد');
        t = t.replace(/BOQ/gi, 'جدول الكميات');

        // إزالة الفواصل من الأرقام (مثل 1,200,000 لتنطق كعدد موحد)
        t = t.replace(/(\d+),(\d+)/g, '$1$2');

        // إزالة الإيموجيات والرموز الخاصة
        t = t.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '');
        t = t.replace(/[()[\]{}#*~`_\\/<>]/g, ' ');

        return t.replace(/\s+/g, ' ').trim();
    }

    // نطق الرد الصوتي بالعربي
    function speakArabic(textToSpeak, activeBtn = null) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        if (isAudioMuted) {
            if (waves) waves.classList.remove('active');
            if (statusText) statusText.innerHTML = '<i class="fa-solid fa-volume-xmark" style="color: #94a3b8;"></i> الصوت مكتوم (يمكنك القراءة)';
            return;
        }

        const cleaned = prepareSpeechText(textToSpeak);
        if (!cleaned) return;

        const utterance = new SpeechSynthesisUtterance(cleaned);
        utterance.lang = 'ar-SA';
        utterance.rate = speechRate;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        const voice = getBestArabicVoice();
        if (voice) {
            utterance.voice = voice;
        }

        utterance.onstart = () => {
            if (waves) waves.classList.add('active');
            if (statusText) statusText.innerHTML = '<i class="fa-solid fa-volume-high" style="color: var(--primary);"></i> المستشار يتحدث الآن... استمع';
            if (activeBtn) activeBtn.classList.add('speaking');
        };

        utterance.onend = () => {
            if (waves) waves.classList.remove('active');
            if (statusText) statusText.innerHTML = '<i class="fa-solid fa-circle"></i> متصل وجاهز للاستماع';
            if (activeBtn) activeBtn.classList.remove('speaking');
        };

        utterance.onerror = () => {
            if (waves) waves.classList.remove('active');
            if (statusText) statusText.innerHTML = '<i class="fa-solid fa-circle"></i> متصل وجاهز للاستماع';
            if (activeBtn) activeBtn.classList.remove('speaking');
        };

        window.speechSynthesis.speak(utterance);
    }

    // قاعدة بيانات المستشار المعماري الذكي (نص شاشة كامل + نطق صوتي مركز ومريح)
    function generateAIResponse(q) {
        const lower = q.toLowerCase();

        // 1. أسئلة المساحة والتكلفة
        const areaMatch = q.match(/(\d+)\s*(متر|م2|م²|م)/);
        if (areaMatch) {
            const area = parseInt(areaMatch[1], 10);
            const minCost = area * 1350 * 2;
            const maxCost = area * 1550 * 2;
            return {
                displayText: `حسب مؤشرات السوق السعودي وكود البناء لعام 2026، بناء فيلا مساحة مسطحاتها حوالي <strong>${area} م²</strong> (دورين) تتراوح تكلفتها التقديرية بين <strong>${minCost.toLocaleString()}</strong> و <strong>${maxCost.toLocaleString()}</strong> ريال سعودي لمستوى التشطيب الديلوكس شامل العظم والمواد.`,
                spokenText: `بناء فيلا مسطحاتها حوالي ${area} متر مربع دورين، تتراوح تكلفتها التقديرية بين ${minCost.toLocaleString().replace(/,/g, ' ')} إلى ${maxCost.toLocaleString().replace(/,/g, ' ')} ريال سعودي، تشطيب ديلوكس شامل العظم والمواد.`
            };
        }

        // 2. العوازل
        if (lower.includes('عازل') || lower.includes('عوازل') || lower.includes('سطح') || lower.includes('تسريب')) {
            return {
                displayText: `لأسطح المباني في السعودية، نوصي بـ <strong>النظام المزدوج المعتمد</strong>:<br>1. عزل مائي بلفائف ممبرين 4 ملم مسلحة بالبوليستر مع اختبار الغمر 48 ساعة.<br>2. عزل حراري بألواح بوليسترين أزرق كثافة 35 كجم/م³ بسماكة 5 سم لحماية السطح وخفض فاتورة الكهرباء حتى 40%.`,
                spokenText: `لأسطح المباني، ننصحك بالنظام المزدوج: عزل مائي بلفائف ممبرين مع اختبار الغمر، يليه عزل حراري بألواح بوليسترين أزرق سماكة خمسة سنتيمتر لخفض فاتورة الكهرباء وحماية السطح.`
            };
        }

        // 3. رخصة إتمام البناء وبلدي
        if (lower.includes('إتمام البناء') || lower.includes('بلدي') || lower.includes('رخصة')) {
            return {
                displayText: `للحصول على <strong>شهادة إتمام البناء</strong> عبر منصة بلدي، يلزم توفير:<br>• تقرير فحص من المشرف الهندسي المعتمد.<br>• شهادة مطابقة العزل الحراري من شركة الكهرباء.<br>• شهادة تركيب أدوات ترشيد المياه.<br>• مطابقة الارتدادات ونسب البناء المصرح بها بالرخصة.`,
                spokenText: `شهادة إتمام البناء تتطلب تقرير المشرف الهندسي المعتمد، وشهادة العزل الحراري من شركة الكهرباء، وترشيد المياه، مع مطابقة الارتدادات المصرح بها.`
            };
        }

        // 4. البلوك البركاني والأسمنتي
        if (lower.includes('بركاني') || lower.includes('بلوك') || lower.includes('طابوق') || lower.includes('جدران')) {
            return {
                displayText: `<strong>البلوك البركاني المعزول</strong> هو الخيار الأفضل للجدران الخارجية؛ فهو خفيف الوزن، عالي العزل الحراري، ومقاوم للحرائق. بينما يفضل استخدام البلوك الأسمنتي للقواطع الداخلية فقط لتوفير التكلفة وقوة التثبيت.`,
                spokenText: `البلوك البركاني المعزول هو الخيار الأفضل للجدران الخارجية، لعزله الحراري العالي وخفة وزنه، بينما يفضل استخدام البلوك الأسمنتي للقواطع الداخلية.`
            };
        }

        // 5. حديد التسليح
        if (lower.includes('حديد') || lower.includes('تسليح') || lower.includes('سابك')) {
            return {
                displayText: `حديد التسليح المعتمد في كود البناء السعودي هو <strong>حديد درجة 60 عالي الشد</strong> (مثل سابك والراجحي). معدل استهلاك الفيلا يتراوح بين 60 إلى 75 كجم لكل متر مربع مسطح بناء، ومتوسط سعر الطن حالياً قرابة 2,950 ريال.`,
                spokenText: `حديد التسليح المعتمد هو درجة ستين عالي الشد مثل سابك والراجحي. ويبلغ متوسط استهلاك المتر المربع قرابة سبعين كيلوجرام، وسعر الطن حوالي ألفين وتسعمائة وخمسين ريال.`
            };
        }

        // 6. المسابح
        if (lower.includes('مسبح') || lower.includes('مسابح')) {
            return {
                displayText: `تكلفة إنشاء مسبح أوفرفلو أو إنفينيتي فيلا مقاس 4×8 متر تتراوح بين <strong>45,000 إلى 65,000 ريال</strong> شاملة الحفر، العزل المائي المزدوج، مضخات وفلاتر المياه، وتمديدات إضاءة الـ LED.`,
                spokenText: `تكلفة إنشاء مسبح فيلا مقاس أربعة في ثمانية أمتار تتراوح بين خمسة وأربعين ألف إلى خمسة وستين ألف ريال، شاملة العزل والمضخات والإضاءة.`
            };
        }

        // 7. الواجهات والتشطيب الخارجي
        if (lower.includes('واجهة') || lower.includes('واجهات') || lower.includes('حجر') || lower.includes('كلادينج') || lower.includes('بروفايل')) {
            return {
                displayText: `لواجهات الفلل الحديثة، المزيج الأحدث يجمع بين <strong>دهان البروفايل المعماري</strong> مع تطعيمات حجر الرياض الطبيعي أو بديل الخشب المعالج WPC المقاوم للحرارة والشمس، لإعطاء فخامة عصرية مع سهولة الصيانة.`,
                spokenText: `لواجهات الفلل العصرية، ننصحك بالمزج بين دهان البروفايل المقاوم للعوامل الجوية مع تطعيمات بديل الخشب الخارجي وحجر الرياض لإعطاء مظهر فخم ومقاوم للشمس.`
            };
        }

        // 8. الرد العام الذكي
        return {
            displayText: `سؤالك مهم جداً في هندسة وتكاليف البناء! من خلال منصة المعمار الذكي، نعتمد على <strong>كود البناء السعودي (SBC)</strong> لتحقيق أعلى معايير الجودة والاستدامة وتوفير التكاليف. يمكنك تجربة حاسبة التكلفة أو محاكي الـ 3D بالأعلى لرؤية تفاصيل فيلتك خطوة بخطوة.`,
            spokenText: `أهلاً بك! مستشارك المعماري الذكي معك دائماً وفق كود البناء السعودي. يسعدني الإجابة عن أي تفصيل في التكاليف والمواد والتراخيص.`
        };
    }
}


// ============================================================
// 1. إدارة النمط المعماري (Theme Switcher: Dark / Light Travertine)
// ============================================================
function initThemeSwitcher() {
    const toggleBtn = document.getElementById('themeToggleBtn');
    const toggleIcon = document.getElementById('themeToggleIcon');
    const toggleText = document.getElementById('themeToggleText');

    if (!toggleBtn) return;

    // استرجاع الثيم المحفوظ
    const savedTheme = localStorage.getItem('site_theme') || 'dark';
    applyTheme(savedTheme);

    toggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = (current === 'dark') ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem('site_theme', next);
    });

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'light') {
            if (toggleIcon) toggleIcon.className = 'fa-solid fa-moon';
            if (toggleText) toggleText.textContent = 'النمط الداكن';
            toggleBtn.title = 'التبديل إلى النمط المعماري الداكن (فحم وبرونز)';
        } else {
            if (toggleIcon) toggleIcon.className = 'fa-solid fa-sun';
            if (toggleText) toggleText.textContent = 'النمط الفاتح';
            toggleBtn.title = 'التبديل إلى نمط الترافرتين الفاتح (حجر طبيعي)';
        }
    }
}

// ============================================================
// 2. إدارة وتحديث بيانات واشتراطات المناطق الجيوتقنية لعام 2026
// ============================================================
const REGIONAL_ADVISORIES = {
    riyadh: {
        name: 'الرياض (العاصمة)',
        factor: 'مؤشر الأساس لعام 2026 (1.0x)',
        soil: 'تربة كلسية صخرية صلبة، تتطلب حفر ميكانيكي مسبق وفحص دقيق لمنسوب التأسيس، مع رص متدرج للدفان واختبار بروكتور للدمك.',
        code: 'اشتراط عزل حراري عالي الكفاءة للجدران والأسطح لمقاومة درجات الحرارة الجافة وتخفيض فاتورة التكييف بنسبة تصل إلى 40%.'
    },
    jeddah: {
        name: 'جدة والمنطقة الساحلية الغربية',
        factor: 'معدل التكلفة (+4% إلى +6%)',
        soil: 'ارتفاع منسوب المياه الجوفية والرطوبة الملحية؛ يتطلب فحص تربة مع اختبار سحب المياه (Dewatering) أثناء صب القواعد وخزان المياه.',
        code: 'إلزامية العزل المائي المزدوج للأساسات ورقاب الأعمدة بلفائف البيتومين المسلحة، مع استخدام أسمنت مقاوم للأملاح والكبريتات (SRC).'
    },
    eastern: {
        name: 'المنطقة الشرقية (الدمام / الخبر / الأحساء)',
        factor: 'معدل التكلفة (-2% لوفرة المواد)',
        soil: 'تربة رملية وسبخية قرب الساحل ذات ملوحة عالية؛ تتطلب دمج التربة وتحسينها بمواد إحلال هندسية معتمدة.',
        code: 'إلزامية استخدام حديد تسليح مدهون بمادة الإيبوكسي الأخضر المعزول لمقاومة الصدأ، ومطابقة اشتراطات أرامكو وسابك لمقاومة التآكل.'
    },
    makkah: {
        name: 'مكة المكرمة',
        factor: 'معدل التكلفة (+8% لوعورة التضاريس)',
        soil: 'طبيعة جبلية صخرية نارية قاسية تتطلب تكسير صخور بالكمبريشن وتأمين الموقع بشباك حماية ضد الانهيارات الصخرية.',
        code: 'اشتراطات سلامة ودفاع مدني صارمة وتصاميم هندسية تتحمل الارتفاعات والكثافة الإنشائية طبقاً لكود أمانات العاصمة المقدسة.'
    },
    madinah: {
        name: 'المدينة المنورة',
        factor: 'معدل التكلفة (+2%)',
        soil: 'مناطق الحرات البركانية والتربة الطينية المتمددة؛ تتطلب في كثير من الأحياء قواعد لبشة خرسانية مسلحة (Raft Foundation).',
        code: 'اشتراطات الواجهات النبوية الحجازية الأصيلة مع عزل صوتي متقدم للمباني السكنية القريبة من المنطقة المركزية.'
    },
    qassim: {
        name: 'منطقة القصيم (بريدة / عنيزة)',
        factor: 'معدل التكلفة (-7% لوفرة المقاولين)',
        soil: 'تربة رملية طينية تحتوي أحياناً على طبقات جبسية مائية؛ تتطلب صب خرسانة نظافة (10 سم) واستخدام أسمنت بورتلاندي مقاوم.',
        code: 'اشتراط فواصل تمدد وهبوط كل 15 إلى 18 متراً لمقاومة الفروقات الحرارية الحادة صيفاً وشتاءً.'
    },
    hail: {
        name: 'منطقة حائل',
        factor: 'معدل التكلفة (-8% وفرة خامات الحجر)',
        soil: 'تربة جرانيتية جبلية صلبة جداً ذات قدرة تحمل عالية (Bearing Capacity عالية)، لا تتطلب أعماق حفر كبيرة.',
        code: 'مراعاة الرياح الشمالية الباردة في الشتاء بعزل حراري مضاعف للنوافذ (Double Glazing) وكسر حراري لألمنيوم الواجهات.'
    },
    abha: {
        name: 'منطقة عسير (أبها / خميس مشيط)',
        factor: 'معدل التكلفة (-5%)',
        soil: 'تضاريس جبلية ذات ميول حادة؛ تتطلب تدعيم الموقع بجدران استنادية مسلحة (Retaining Walls) وتصريف مدروس للمياه.',
        code: 'تصميم ميول أسطح وأنظمة مزاريب وتصريف أمطار متطورة للتعامل مع غزارة الأمطار والضباب والرطوبة المرتفعة.'
    },
    tabuk: {
        name: 'منطقة تبوك ونيوم',
        factor: 'معدل التكلفة (-4%)',
        soil: 'تربة حجرية رملية جافة، صلبة ومثالية للتأسيس السطحي للقواعد الشريطية والمنفصلة.',
        code: 'مطابقة مواصفات الاستدامة وكفاءة الطاقة الحديثة المتوافقة مع معايير مشاريع البحر الأحمر ونيوم الخضراء.'
    },
    taif: {
        name: 'مدينة الطائف',
        factor: 'معدل التكلفة (-5%)',
        soil: 'تربة جبلية جرانيتية ومناخ معتدل؛ ممتازة لصب الخرسانات المسلحة بجهد عالي وسرعة جفاف وتصلب جيدة.',
        code: 'مراعاة اشتراطات العزل الحراري لموجات البرد الشتوية واستغلال الإضاءة الطبيعية في التوزيع المعماري.'
    },
    other: {
        name: 'المناطق والمحافظات الأخرى',
        factor: 'المعدل القياسي لعام 2026 (1.0x)',
        soil: 'يلزم دائماً عمل فحص تربة معتمد (جَسّتين على الأقل) لتحديد منسوب التأسيس الصحيح وقدرة تحمل التربة.',
        code: 'الالتزام الشامل بكود البناء السعودي (SBC) للمباني السكنية رقم 1101 لضمان جودة الهيكل وشهادة إتمام البناء.'
    }
};

function updateRegionalAdvisory(regionKey) {
    const data = REGIONAL_ADVISORIES[regionKey] || REGIONAL_ADVISORIES.riyadh;
    const badge = document.getElementById('advisoryCityBadge');
    const factor = document.getElementById('advisoryCostFactor');
    const soil = document.getElementById('advisorySoilText');
    const code = document.getElementById('advisoryCodeText');

    if (badge) badge.innerHTML = `<i class="fa-solid fa-location-dot"></i> مؤشر ${data.name}`;
    if (factor) factor.textContent = data.factor;
    if (soil) soil.textContent = data.soil;
    if (code) code.textContent = data.code;
}

// ============================================================
// 3. ربط أدوات محاكي مسار الشمس والظلال 3D
// ============================================================
function initSunPathControls() {
    const btnToggle = document.getElementById('btnSunPath3D');
    const panel = document.getElementById('sunPathPanel');
    const closeBtn = document.getElementById('closeSunPathBtn');
    const slider = document.getElementById('sunTimeSlider');
    const timeDisplay = document.getElementById('sunTimeDisplay');
    const shadowDesc = document.getElementById('sunShadowDesc');
    const quickBtns = document.querySelectorAll('.sun-quick-btn');

    if (btnToggle && panel) {
        btnToggle.addEventListener('click', () => {
            panel.classList.toggle('hidden');
        });
    }

    if (closeBtn && panel) {
        closeBtn.addEventListener('click', () => {
            panel.classList.add('hidden');
        });
    }

    function applyHour(hourVal) {
        const hour = parseFloat(hourVal);
        if (slider) slider.value = hour;

        // تحديث النص والوصف
        let timeStr = '';
        let descStr = '';
        let icon = 'fa-sun';

        if (hour < 12) {
            const h = Math.floor(hour);
            const m = Math.round((hour - h) * 60);
            const mStr = (m < 10 ? '0' : '') + m;
            timeStr = `${h}:${mStr} ص`;
            if (hour <= 8) {
                timeStr += ' (شروق الشمس والصباح الباكر)';
                descStr = 'ظلال صباحية ذهبية ممتدة نحو الغرب - كاسرات الشمس تحمي غرف النوم الشرقية';
                icon = 'fa-cloud-sun';
            } else {
                timeStr += ' (ضحى مشرق)';
                descStr = 'زاوية شمس معتدلة - إضاءة طبيعية دافئة في الفناء والمسبح';
            }
        } else if (hour === 12) {
            timeStr = '12:00 م (شمس الظهيرة العمودية)';
            descStr = 'ظلال رأسية حادة تحت البرجولا - أفضل زاوية كفاءة للألواح الشمسية على السطح';
            icon = 'fa-sun';
        } else {
            const h = Math.floor(hour) - 12;
            const m = Math.round((hour - Math.floor(hour)) * 60);
            const mStr = (m < 10 ? '0' : '') + m;
            timeStr = `${h === 0 ? 12 : h}:${mStr} م`;
            if (hour >= 16.5) {
                timeStr += ' (شفق الغروب الذهبي)';
                descStr = 'أشعة غروب ساحرة وظلال طويلة ممتدة نحو الشرق - أجواء استرخاء مثالية على المسبح';
                icon = 'fa-mountain-sun';
            } else {
                timeStr += ' (وقت العصر)';
                descStr = 'انكسار حرارة الشمس - تظليل جزئي على حديقة الفيلا';
            }
        }

        if (timeDisplay) {
            timeDisplay.innerHTML = `<i class="fa-solid ${icon}"></i> ${timeStr}`;
        }
        if (shadowDesc) {
            shadowDesc.textContent = descStr;
        }

        // تحديث المشهد 3D
        if (typeof constructionSimulatorInstance !== 'undefined' && constructionSimulatorInstance) {
            constructionSimulatorInstance.setSunTime(hour);
        }

        // تحديث الأزرار السريعة
        quickBtns.forEach(btn => {
            const bH = parseFloat(btn.getAttribute('data-hour'));
            if (Math.abs(bH - hour) < 0.5) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    if (slider) {
        slider.addEventListener('input', (e) => {
            applyHour(e.target.value);
        });
    }

    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const h = btn.getAttribute('data-hour');
            if (h) applyHour(h);
        });
    });
}
