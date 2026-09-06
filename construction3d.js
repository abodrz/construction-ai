/**
 * المعمار الذكي - محرك محاكاة البناء ثلاثي الأبعاد (3D Construction Simulator)
 * مطور بواسطة: عامر درزي العنزي
 * تقنية: Three.js (100% Client-side, Compatible with GitHub Pages)
 */

class ConstructionSimulator3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.currentStage = 1;
        this.totalStages = 5;
        this.isNight = false;
        this.isXRay = false;
        this.isAutoPlaying = false;
        this.autoPlayInterval = null;

        this.stagesData = {
            1: {
                title: "المرحلة الأولى: تجهيز الموقع والحفر",
                tag: "الأعمال الترابية والتمهيد",
                percent: 15,
                cost: "25,000 - 45,000 ر.س",
                duration: "2 - 3 أسابيع",
                materials: "حفر صخري، دمك تربة، صبة نظافة 10سم، سياج أمني",
                tip: "احرص على إجراء اختبار فحص التربة (Soil Test) لتحديد عمق التأسيس ونوعية القواعد المناسبة بدقة."
            },
            2: {
                title: "المرحلة الثانية: القواعد والميدات والأساسات",
                tag: "الأساسات العميقة والسطحية",
                percent: 35,
                cost: "85,000 - 130,000 ر.س",
                duration: "3 - 5 أسابيع",
                materials: "خرسانة مقاومة للأملاح (SRC)، حديد تسليح عالي الشد (سرك)، عزل مائي بيتوميني",
                tip: "العزل المائي للقواعد والميدات يحمي حديد التسليح من الصدأ والمياه الجوفية لعشرات السنين."
            },
            3: {
                title: "المرحلة الثالثة: الهيكل الإنشائي والأعمدة والأسقف",
                tag: "العظم الإنشائي",
                percent: 60,
                cost: "160,000 - 240,000 ر.س",
                duration: "8 - 12 أسبوع",
                materials: "خرسانة جاهزة K-350، حديد سابك 14-16 ملم، خشب بليود للصبة المعمارية",
                tip: "التأكد من رش الخرسانة بالماء (المعالجة المائية) مرتين يومياً لمدة 7 أيام متواصلة لضمان أقصى متانة."
            },
            4: {
                title: "المرحلة الرابعة: أعمال البلوك والجدران والعوازل",
                tag: "المباني والتقسيمات",
                percent: 80,
                cost: "70,000 - 110,000 ر.س",
                duration: "4 - 6 أسابيع",
                materials: "طابوق بركاني عازل للحرارة، شبك زوايا مجلفن، خلطة إسمنتية معالجة",
                tip: "استخدام البلوك البركاني المعزول يقلل استهلاك مكيفات الهواء في الصيف بنسبة تصل إلى 40%."
            },
            5: {
                title: "المرحلة الخامسة: التشطيبات الفاخرة والواجهات والمسبح",
                tag: "الواجهات المودرن واللاندسكيب",
                percent: 100,
                cost: "220,000 - 380,000 ر.س",
                duration: "10 - 16 أسبوع",
                materials: "رخام ترافنتينو، بديل خشب خارجي WPC، زجاج دبل جلاس عاكس، إضاءات LED معمارية",
                tip: "الواجهات الزجاجية البانورامية مع كاسرات الشمس الخشبية تمنح فيلتك طابعاً معمارياً فائق الفخامة والراحة."
            }
        };

        this.stageGroups = {};
        this.lights = {};
        this.materials = {};

        this.init();
    }

    init() {
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 520;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0f1d);
        this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.015);

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(22, 16, 24);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;

        const oldCanvas = this.container.querySelector('canvas');
        if (oldCanvas) oldCanvas.remove();
        this.container.appendChild(this.renderer.domElement);

        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxPolarAngle = Math.PI / 2 - 0.03;
            this.controls.minDistance = 8;
            this.controls.maxDistance = 65;
            this.controls.target.set(0, 3.5, 0);
        }

        this.initMaterials();
        this.initLights();
        this.initEnvironment();
        this.buildAllStages();
        this.setStage(1);

        this.resizeHandler = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.resizeHandler);

        this.animate = this.animate.bind(this);
        this.isDestroyed = false;
        requestAnimationFrame(this.animate);
    }

    initMaterials() {
        this.materials.dirt = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.95, metalness: 0.05 });
        this.materials.sand = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.9, metalness: 0.0 });
        this.materials.concrete = new THREE.MeshStandardMaterial({ color: 0x8a9098, roughness: 0.85, metalness: 0.1 });
        this.materials.concreteDark = new THREE.MeshStandardMaterial({ color: 0x555a60, roughness: 0.9, metalness: 0.15 });
        this.materials.rebar = new THREE.MeshStandardMaterial({ color: 0x9b3a1a, roughness: 0.4, metalness: 0.8 });
        this.materials.brick = new THREE.MeshStandardMaterial({ color: 0x9a3822, roughness: 0.8, metalness: 0.05 });
        this.materials.travertine = new THREE.MeshStandardMaterial({ color: 0xf5efe6, roughness: 0.35, metalness: 0.05 });
        this.materials.darkAccent = new THREE.MeshStandardMaterial({ color: 0x1e2229, roughness: 0.3, metalness: 0.4 });
        this.materials.wood = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.5, metalness: 0.1 });
        this.materials.glass = new THREE.MeshPhysicalMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.55,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.85,
            ior: 1.5
        });
        this.materials.glassRailing = new THREE.MeshPhysicalMaterial({
            color: 0x00d4ff,
            transparent: true,
            opacity: 0.45,
            roughness: 0.1,
            metalness: 0.1
        });
        this.materials.water = new THREE.MeshStandardMaterial({
            color: 0x00b4d8,
            roughness: 0.1,
            metalness: 0.3,
            transparent: true,
            opacity: 0.85
        });
        this.materials.grass = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.9, metalness: 0.05 });
        this.materials.paving = new THREE.MeshStandardMaterial({ color: 0x495057, roughness: 0.7, metalness: 0.1 });
        this.materials.ledWarm = new THREE.MeshBasicMaterial({ color: 0xffd166 });
        this.materials.ledCyan = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
        this.materials.xraySkeleton = new THREE.MeshBasicMaterial({ color: 0xff8c00 });
        this.materials.xrayWall = new THREE.MeshStandardMaterial({ color: 0x00a8ff, wireframe: true, transparent: true, opacity: 0.35 });
    }

    initLights() {
        this.lights.ambient = new THREE.AmbientLight(0xffffff, 0.75);
        this.scene.add(this.lights.ambient);

        this.lights.sun = new THREE.DirectionalLight(0xfff7ed, 1.4);
        this.lights.sun.position.set(25, 35, 18);
        this.lights.sun.castShadow = true;
        this.lights.sun.shadow.mapSize.width = 2048;
        this.lights.sun.shadow.mapSize.height = 2048;
        this.lights.sun.shadow.camera.near = 0.5;
        this.lights.sun.shadow.camera.far = 120;
        const d = 25;
        this.lights.sun.shadow.camera.left = -d;
        this.lights.sun.shadow.camera.right = d;
        this.lights.sun.shadow.camera.top = d;
        this.lights.sun.shadow.camera.bottom = -d;
        this.lights.sun.shadow.bias = -0.0005;
        this.scene.add(this.lights.sun);

        this.lights.fill = new THREE.DirectionalLight(0x7090b0, 0.4);
        this.lights.fill.position.set(-20, 15, -20);
        this.scene.add(this.lights.fill);

        this.lights.villaSpot1 = new THREE.PointLight(0xffb703, 0, 18);
        this.lights.villaSpot1.position.set(2, 3.5, 6.5);
        this.scene.add(this.lights.villaSpot1);

        this.lights.villaSpot2 = new THREE.PointLight(0xffb703, 0, 18);
        this.lights.villaSpot2.position.set(-4, 3.5, 6.5);
        this.scene.add(this.lights.villaSpot2);

        this.lights.poolLight = new THREE.PointLight(0x00f5d4, 0, 14);
        this.lights.poolLight.position.set(6, 0.5, 2.5);
        this.scene.add(this.lights.poolLight);
    }

    initEnvironment() {
        const groundGeo = new THREE.PlaneGeometry(70, 70);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x121826, roughness: 0.95 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.05;
        ground.receiveShadow = true;
        this.scene.add(ground);

        const grid = new THREE.GridHelper(50, 50, 0x00d4ff, 0x1f293d);
        grid.position.y = -0.04;
        this.scene.add(grid);
    }

    buildAllStages() {
        for (let i = 1; i <= 5; i++) {
            this.stageGroups[i] = new THREE.Group();
            this.scene.add(this.stageGroups[i]);
        }
        this.buildStage1();
        this.buildStage2();
        this.buildStage3();
        this.buildStage4();
        this.buildStage5();
    }

    buildStage1() {
        const group = this.stageGroups[1];
        const pitGeo = new THREE.BoxGeometry(17, 1.2, 15);
        const pitMesh = new THREE.Mesh(pitGeo, this.materials.dirt);
        pitMesh.position.set(0, -0.6, 0);
        pitMesh.receiveShadow = true;
        group.add(pitMesh);

        for (let i = 0; i < 6; i++) {
            const moundGeo = new THREE.ConeGeometry(1.2 + Math.random() * 0.8, 1.2, 7);
            const mound = new THREE.Mesh(moundGeo, this.materials.sand);
            const angle = (i / 6) * Math.PI * 2;
            mound.position.set(Math.cos(angle) * 10.5, 0.6, Math.sin(angle) * 9);
            mound.castShadow = true;
            group.add(mound);
        }

        const fenceMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5, metalness: 0.3 });
        const fenceOffsets = [
            { x: 0, z: -8.8, w: 20, d: 0.1 },
            { x: 0, z: 8.8, w: 20, d: 0.1 },
            { x: -9.8, z: 0, w: 0.1, d: 17.6 },
            { x: 9.8, z: 0, w: 0.1, d: 17.6 }
        ];
        fenceOffsets.forEach(f => {
            const panel = new THREE.Mesh(new THREE.BoxGeometry(f.w, 1.6, f.d), fenceMat);
            panel.position.set(f.x, 0.8, f.z);
            panel.castShadow = true;
            group.add(panel);
        });

        const tripodGroup = new THREE.Group();
        const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4);
        const legMat = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
        for (let a = 0; a < 3; a++) {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(Math.cos(a * 2.09) * 0.35, 0.7, Math.sin(a * 2.09) * 0.35);
            leg.rotation.z = Math.cos(a * 2.09) * 0.2;
            leg.rotation.x = Math.sin(a * 2.09) * 0.2;
            tripodGroup.add(leg);
        }
        const totalStation = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.25), new THREE.MeshStandardMaterial({ color: 0x00d4ff }));
        totalStation.position.y = 1.45;
        tripodGroup.add(totalStation);
        tripodGroup.position.set(-8, 0, 6);
        group.add(tripodGroup);
    }

    buildStage2() {
        const group = this.stageGroups[2];
        const blindingSlab = new THREE.Mesh(new THREE.BoxGeometry(15.5, 0.15, 13.5), this.materials.concreteDark);
        blindingSlab.position.set(0, 0.07, 0);
        blindingSlab.receiveShadow = true;
        group.add(blindingSlab);

        this.footingPositions = [
            { x: -5.5, z: -4.5 }, { x: 0, z: -4.5 }, { x: 5.5, z: -4.5 },
            { x: -5.5, z: 0 }, { x: 0, z: 0 }, { x: 5.5, z: 0 },
            { x: -5.5, z: 4.5 }, { x: 0, z: 4.5 }, { x: 5.5, z: 4.5 }
        ];

        this.footingPositions.forEach(p => {
            const footing = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 1.8), this.materials.concrete);
            footing.position.set(p.x, 0.45, p.z);
            footing.castShadow = true;
            footing.receiveShadow = true;
            group.add(footing);

            const neck = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.5), this.materials.concrete);
            neck.position.set(p.x, 1.05, p.z);
            neck.castShadow = true;
            group.add(neck);

            for (let r = 0; r < 4; r++) {
                const rebar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.1), this.materials.rebar);
                const rx = (r % 2 === 0 ? -0.15 : 0.15);
                const rz = (r < 2 ? -0.15 : 0.15);
                rebar.position.set(p.x + rx, 1.7, p.z + rz);
                group.add(rebar);
            }
        });

        [-4.5, 0, 4.5].forEach(z => {
            const beam = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.5, 0.4), this.materials.concrete);
            beam.position.set(0, 0.9, z);
            beam.castShadow = true;
            group.add(beam);
        });
        [-5.5, 0, 5.5].forEach(x => {
            const beam = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 9.5), this.materials.concrete);
            beam.position.set(x, 0.9, 0);
            beam.castShadow = true;
            group.add(beam);
        });
    }

    buildStage3() {
        const group = this.stageGroups[3];

        this.footingPositions.forEach(p => {
            const col = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.2, 0.55), this.materials.concrete);
            col.position.set(p.x, 2.7, p.z);
            col.castShadow = true;
            col.receiveShadow = true;
            group.add(col);
        });

        const slab1 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 12), this.materials.concrete);
        slab1.position.set(0, 4.5, 0);
        slab1.castShadow = true;
        slab1.receiveShadow = true;
        group.add(slab1);

        this.footingPositions.forEach(p => {
            if (p.x === 5.5 && p.z === 4.5) return;
            const col2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.0, 0.5), this.materials.concrete);
            col2.position.set(p.x, 6.2, p.z);
            col2.castShadow = true;
            group.add(col2);
        });

        const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.35, 12.4), this.materials.concrete);
        roofSlab.position.set(0, 7.85, 0);
        roofSlab.castShadow = true;
        group.add(roofSlab);

        const parapet = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.9, 0.3), this.materials.concrete);
        parapet.position.set(0, 8.45, -6.1);
        group.add(parapet);

        for (let s = 0; s < 10; s++) {
            const step = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 0.35), this.materials.concrete);
            step.position.set(-4.2, 1.2 + s * 0.32, -2.5 + s * 0.32);
            step.castShadow = true;
            group.add(step);
        }
    }

    buildStage4() {
        const group = this.stageGroups[4];
        const wallMat = this.materials.brick;

        const backWall1 = new THREE.Mesh(new THREE.BoxGeometry(11, 3.2, 0.25), wallMat);
        backWall1.position.set(0, 2.7, -4.5);
        backWall1.castShadow = true;
        group.add(backWall1);

        const leftWall1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 8.8), wallMat);
        leftWall1.position.set(-5.5, 2.7, 0);
        leftWall1.castShadow = true;
        group.add(leftWall1);

        const rightWall1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, 4), wallMat);
        rightWall1.position.set(5.5, 2.7, -2.2);
        rightWall1.castShadow = true;
        group.add(rightWall1);

        const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.2, 0.25), wallMat);
        frontWallLeft.position.set(-3.2, 2.7, 4.5);
        frontWallLeft.castShadow = true;
        group.add(frontWallLeft);

        const backWall2 = new THREE.Mesh(new THREE.BoxGeometry(11, 3.0, 0.25), wallMat);
        backWall2.position.set(0, 6.2, -4.5);
        backWall2.castShadow = true;
        group.add(backWall2);

        const leftWall2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.0, 8.8), wallMat);
        leftWall2.position.set(-5.5, 6.2, 0);
        leftWall2.castShadow = true;
        group.add(leftWall2);

        const frontUpperWall = new THREE.Mesh(new THREE.BoxGeometry(5.0, 3.0, 0.25), wallMat);
        frontUpperWall.position.set(-3.0, 6.2, 4.5);
        frontUpperWall.castShadow = true;
        group.add(frontUpperWall);

        const partition1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 4.2), wallMat);
        partition1.position.set(0, 2.7, -2.2);
        group.add(partition1);

        const partition2 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.0, 0.2), wallMat);
        partition2.position.set(2.6, 6.2, 0);
        group.add(partition2);
    }

    buildStage5() {
        const group = this.stageGroups[5];

        const facadeStoneGround = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.3, 0.35), this.materials.travertine);
        facadeStoneGround.position.set(-3.2, 2.7, 4.6);
        facadeStoneGround.castShadow = true;
        group.add(facadeStoneGround);

        const upperBox = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.2, 4.8), this.materials.travertine);
        upperBox.position.set(2.8, 6.2, 2.8);
        upperBox.castShadow = true;
        group.add(upperBox);

        for (let l = 0; l < 16; l++) {
            const louver = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.0, 0.12), this.materials.wood);
            louver.position.set(0.2 + l * 0.34, 6.2, 5.25);
            louver.castShadow = true;
            group.add(louver);
        }

        const glassWallGround = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.1, 0.08), this.materials.glass);
        glassWallGround.position.set(2.8, 2.7, 4.5);
        group.add(glassWallGround);

        const frameMat = this.materials.darkAccent;
        const frameTop = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.12, 0.16), frameMat);
        frameTop.position.set(2.8, 4.2, 4.5);
        group.add(frameTop);

        const frameBottom = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.12, 0.16), frameMat);
        frameBottom.position.set(2.8, 1.2, 4.5);
        group.add(frameBottom);

        const glassRailing = new THREE.Mesh(new THREE.BoxGeometry(5.4, 1.0, 0.05), this.materials.glassRailing);
        glassRailing.position.set(-3.1, 5.1, 4.7);
        group.add(glassRailing);

        const pergolaMat = this.materials.darkAccent;
        for (let p = 0; p < 8; p++) {
            const slat = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 5.0), pergolaMat);
            slat.position.set(-4.5 + p * 0.7, 9.2, 1.5);
            slat.castShadow = true;
            group.add(slat);
        }
        const beamP1 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.2, 0.15), pergolaMat);
        beamP1.position.set(-2.0, 9.1, 3.8);
        group.add(beamP1);
        const beamP2 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.2, 0.15), pergolaMat);
        beamP2.position.set(-2.0, 9.1, -0.8);
        group.add(beamP2);

        const poolBorder = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.2, 4.2), this.materials.travertine);
        poolBorder.position.set(6.2, 0.1, 2.5);
        group.add(poolBorder);

        const poolWater = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.08, 3.8), this.materials.water);
        poolWater.position.set(6.2, 0.16, 2.5);
        group.add(poolWater);

        const grassLawn = new THREE.Mesh(new THREE.BoxGeometry(18, 0.1, 8), this.materials.grass);
        grassLawn.position.set(0, 0.08, 9.5);
        grassLawn.receiveShadow = true;
        group.add(grassLawn);

        for (let s = 0; s < 5; s++) {
            const stone = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.14, 0.9), this.materials.travertine);
            stone.position.set(-2.5, 0.12, 6.8 + s * 1.3);
            stone.castShadow = true;
            group.add(stone);
        }

        const treePositions = [
            { x: -7.5, z: 8.5 },
            { x: -7.5, z: 12.0 },
            { x: 7.5, z: 12.0 }
        ];
        treePositions.forEach(tp => {
            const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.45, 0.8, 12), this.materials.darkAccent);
            pot.position.set(tp.x, 0.45, tp.z);
            pot.castShadow = true;
            group.add(pot);

            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 3.2, 8), this.materials.wood);
            trunk.position.set(tp.x, 2.0, tp.z);
            trunk.castShadow = true;
            group.add(trunk);

            for (let f = 0; f < 6; f++) {
                const frond = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.8, 4), this.materials.grass);
                frond.position.set(tp.x + Math.cos(f * 1.05) * 0.7, 3.4, tp.z + Math.sin(f * 1.05) * 0.7);
                frond.rotation.z = Math.cos(f * 1.05) * 0.6;
                frond.rotation.x = Math.sin(f * 1.05) * 0.6;
                group.add(frond);
            }
        });

        const ledStrip1 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.06, 0.06), this.materials.ledWarm);
        ledStrip1.position.set(2.8, 4.55, 5.22);
        group.add(ledStrip1);

        const ledStrip2 = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.06, 0.06), this.materials.ledCyan);
        ledStrip2.position.set(0, 7.82, 6.22);
        group.add(ledStrip2);
    }

    setStage(stageNum) {
        this.currentStage = Math.max(1, Math.min(5, stageNum));

        for (let i = 1; i <= 5; i++) {
            const group = this.stageGroups[i];
            if (i <= this.currentStage) {
                if (!group.visible) {
                    group.visible = true;
                    group.position.y = -0.5;
                }
            } else {
                group.visible = false;
            }
        }

        this.updateHUD();

        const buttons = document.querySelectorAll('.stage-pill-btn');
        buttons.forEach(btn => {
            const s = parseInt(btn.getAttribute('data-stage'), 10);
            if (s === this.currentStage) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    updateHUD() {
        const data = this.stagesData[this.currentStage];
        if (!data) return;

        const titleEl = document.getElementById('hudStageTitle');
        const tagEl = document.getElementById('hudStageTag');
        const percentEl = document.getElementById('hudStagePercent');
        const costEl = document.getElementById('hudStageCost');
        const durationEl = document.getElementById('hudStageDuration');
        const materialsEl = document.getElementById('hudStageMaterials');
        const tipEl = document.getElementById('hudStageTip');
        const progressBar = document.getElementById('hudProgressBar');

        if (titleEl) titleEl.innerText = data.title;
        if (tagEl) tagEl.innerText = data.tag;
        if (percentEl) percentEl.innerText = `${data.percent}%`;
        if (costEl) costEl.innerText = data.cost;
        if (durationEl) durationEl.innerText = data.duration;
        if (materialsEl) materialsEl.innerText = data.materials;
        if (tipEl) tipEl.innerText = data.tip;
        if (progressBar) progressBar.style.width = `${data.percent}%`;
    }

    toggleAutoPlay() {
        this.isAutoPlaying = !this.isAutoPlaying;
        const btn = document.getElementById('btnAutoPlay3D');

        if (this.isAutoPlaying) {
            if (btn) {
                btn.innerHTML = '<i class="fa-solid fa-pause"></i> إيقاف العرض';
                btn.classList.add('playing');
            }
            this.setStage(1);
            let nextStage = 2;

            this.autoPlayInterval = setInterval(() => {
                this.setStage(nextStage);
                nextStage++;
                if (nextStage > 5) {
                    nextStage = 1;
                }
            }, 3200);
        } else {
            if (btn) {
                btn.innerHTML = '<i class="fa-solid fa-play"></i> تشغيل البناء التلقائي';
                btn.classList.remove('playing');
            }
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
        }
    }

    toggleDayNight() {
        this.isNight = !this.isNight;
        const btn = document.getElementById('btnDayNight3D');

        if (this.isNight) {
            this.scene.background.set(0x050811);
            this.scene.fog.color.set(0x050811);
            this.lights.ambient.intensity = 0.25;
            this.lights.sun.intensity = 0.15;
            this.lights.sun.color.set(0x4361ee);

            this.lights.villaSpot1.intensity = 2.5;
            this.lights.villaSpot2.intensity = 2.5;
            this.lights.poolLight.intensity = 3.0;

            if (btn) btn.innerHTML = '<i class="fa-solid fa-sun"></i> الوضع النهاري';
        } else {
            this.scene.background.set(0x0a0f1d);
            this.scene.fog.color.set(0x0a0f1d);
            this.lights.ambient.intensity = 0.75;
            this.lights.sun.intensity = 1.4;
            this.lights.sun.color.set(0xfff7ed);

            this.lights.villaSpot1.intensity = 0;
            this.lights.villaSpot2.intensity = 0;
            this.lights.poolLight.intensity = 0;

            if (btn) btn.innerHTML = '<i class="fa-solid fa-moon"></i> الوضع الليلي';
        }
    }

    toggleXRay() {
        this.isXRay = !this.isXRay;
        const btn = document.getElementById('btnXRay3D');

        this.stageGroups[4].traverse(child => {
            if (child.isMesh) {
                child.material = this.isXRay ? this.materials.xrayWall : this.materials.brick;
            }
        });

        this.stageGroups[5].traverse(child => {
            if (child.isMesh && child.material !== this.materials.glass && child.material !== this.materials.water) {
                if (!child.userData.originalMat) child.userData.originalMat = child.material;
                child.material = this.isXRay ? this.materials.xrayWall : child.userData.originalMat;
            }
        });

        this.stageGroups[2].traverse(child => {
            if (child.isMesh) {
                child.material = this.isXRay ? this.materials.xraySkeleton : this.materials.concrete;
            }
        });

        this.stageGroups[3].traverse(child => {
            if (child.isMesh) {
                child.material = this.isXRay ? this.materials.xraySkeleton : this.materials.concrete;
            }
        });

        if (btn) {
            btn.classList.toggle('active', this.isXRay);
        }
    }

    setCameraView(viewName) {
        if (!this.controls) return;

        const views = {
            isometric: { pos: [22, 16, 24], target: [0, 3.5, 0] },
            drone: { pos: [0, 34, 3], target: [0, 0, 0] },
            front: { pos: [0, 5, 24], target: [0, 4, 0] },
            pool: { pos: [12, 3.5, 9], target: [5, 2, 2] }
        };

        const view = views[viewName] || views.isometric;
        this.targetCamPos = new THREE.Vector3(...view.pos);
        this.targetCamLook = new THREE.Vector3(...view.target);
    }

    resetCamera() {
        this.setCameraView('isometric');
    }

    onWindowResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        if (width === 0 || height === 0) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        if (this.isDestroyed) return;
        requestAnimationFrame(this.animate);

        if (this.targetCamPos) {
            this.camera.position.lerp(this.targetCamPos, 0.05);
            if (this.controls && this.targetCamLook) {
                this.controls.target.lerp(this.targetCamLook, 0.05);
            }
            if (this.camera.position.distanceTo(this.targetCamPos) < 0.1) {
                this.targetCamPos = null;
                this.targetCamLook = null;
            }
        }

        if (this.isAutoPlaying && this.controls) {
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 1.2;
        } else if (this.controls) {
            this.controls.autoRotate = false;
        }

        for (let i = 1; i <= 5; i++) {
            const grp = this.stageGroups[i];
            if (grp && grp.visible && grp.position.y < 0) {
                grp.position.y += (0 - grp.position.y) * 0.15;
            }
        }

        if (this.controls) this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        this.isDestroyed = true;
        if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
        window.removeEventListener('resize', this.resizeHandler);
        if (this.renderer && this.renderer.domElement) {
            this.renderer.domElement.remove();
        }
    }
}

window.ConstructionSimulator3D = ConstructionSimulator3D;
