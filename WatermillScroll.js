(function () {
  "use strict";

  const CONFIG = {
    desktopColumnWidthCss: "clamp(180px, 18vw, 220px)", // css length: default desktop column width for the fixed sidebar.
    smallScreenBreakpointPx: 640, // px: viewport width where the floating overlay layout activates.
    smallScreenColumnWidthCss: "100vw", // css length: overlay width on small screens so the widget spans the page width.
    smallScreenColumnHeightCss: "100vh", // css length: small-screen overlay height for the simplified full-screen mobile layout.
    resizeDebounceMs: 150, // ms: delay before rebuilding the world after resize settles.
    engineGravityY: 0.62, // px/frame^2: vertical gravity strength used by Matter.js.
    hoseLinkCount: 16, // count: number of linked hose segments including the nozzle body.
    hoseLinkRadiusPx: 6, // px: radius of each hose link body.
    hoseLinkAirFriction: 0.02, // ratio: drag applied to hose links to calm oscillation.
    hoseLinkRestitution: 0.05, // ratio: bounce response of hose links.
    hoseConstraintStiffness: 0.05, // ratio: stiffness of hose constraints between links.
    hoseConstraintDamping: 0.1, // ratio: damping of hose constraints between links.
    hoseRenderWidthPx: 10, // px: rendered hose thickness.
    hoseAttachmentOffsetYPx: -20, // px: attachment point above the top edge of the canvas.
    hoseDefaultReachRatio: 0.18, // ratio: default hanging reach as a share of canvas height.
    nozzleGrabRadiusPx: 20, // px: pointer hit radius for grabbing the nozzle.
    nozzleHorizontalPaddingPx: 8, // px: horizontal inset used to clamp nozzle drag.
    nozzleBottomClearancePx: 10, // px: clearance above the wheel when clamping nozzle drag.
    nozzleCapLengthPx: 12, // px: visual length of the nozzle cap.
    nozzleCapRearOffsetPx: 4, // px: amount of nozzle cap drawn back over the hose tip so the join looks centered.
    nozzleVerticalSnapThresholdPx: 2.5, // px: horizontal final-link deviation below which the nozzle is treated as straight down.
    nozzleStreamSpeedPxPerFrame: 11.5, // px/frame: baseline launch speed of water particles.
    nozzleSpeedMinDepthScale: 0.75, // ratio: shallow-drag multiplier for particle launch speed.
    nozzleSpeedMaxDepthScale: 1.15, // ratio: deep-drag multiplier for particle launch speed.
    nozzleMaxDeflectionFromVerticalRadians: 1.1, // radians: furthest the nozzle may tilt left or right away from straight down.
    emissionMinParticlesPerFrame: 1, // count/frame: minimum particle output while dragging.
    emissionMaxParticlesPerFrame: 6, // count/frame: maximum particle output while dragging.
    emissionSpreadRadians: 0.18, // radians: random spray spread around the nozzle direction.
    smallScreenEmissionScale: 0.72, // ratio: emission reduction while in small-screen overlay mode.
    particleRadiusPx: 3, // px: radius of each water particle.
    particleAirFriction: 0.006, // ratio: drag coefficient applied to water particles.
    particleRestitution: 0.2, // ratio: bounce amount for water particles.
    particleDensity: 0.0008, // mass density: matter body density for water particles.
    particleLifetimeMs: 4500, // ms: maximum water particle lifespan.
    particleRestSpeedPxPerFrame: 0.2, // px/frame: speed below which settled particles are culled.
    maxParticles: 300, // count: hard cap on active water particles.
    splashParticleMinCount: 3, // count: minimum decorative splash droplet count.
    splashParticleMaxCount: 5, // count: maximum decorative splash droplet count.
    splashLifetimeMs: 300, // ms: lifespan of decorative splash droplets.
    splashSpeedPxPerMs: 0.08, // px/ms: baseline decorative splash speed.
    splashSpeedMinScale: 0.7, // ratio: minimum splash speed multiplier.
    splashSpeedMaxScale: 1.2, // ratio: maximum splash speed multiplier.
    splashGravityPxPerMs2: 0.00018, // px/ms^2: gravity for decorative splash droplets.
    splashImpactThresholdPxPerFrame: 6, // px/frame: minimum impact speed that spawns splashes.
    splashArcMinRadians: -Math.PI * 0.9, // radians: lower bound for splash arc direction.
    splashArcMaxRadians: -Math.PI * 0.1, // radians: upper bound for splash arc direction.
    splashSideBiasRadians: 0.12, // radians: side-based splash direction bias.
    wheelPaddingPx: 10, // px: inset between wheel radius and column edges.
    smallScreenWheelRadiusScale: 0.62, // ratio: wheel radius multiplier applied in the small-screen overlay layout.
    wheelPaddleCount: 8, // count: default paddle count for the wheel.
    wheelPaddleWidthRatio: 0.12, // ratio: paddle thickness as a share of measured column width.
    smallScreenWheelPaddleWidthScale: 0.62, // ratio: paddle width multiplier applied in the small-screen overlay layout.
    wheelPaddleLengthRatio: 0.62, // ratio: paddle length as a share of wheel radius.
    wheelPaddleCornerRadiusPx: 2, // px: corner radius used when rendering wheel paddles.
    wheelHubRadiusRatio: 0.1, // ratio: hub radius as a share of measured column width.
    wheelImpulseFactor: 0.0019, // angular velocity per (px/frame): spin added per particle impact speed.
    wheelAngularDamping: 0.95, // ratio/frame: per-frame damping applied to wheel spin.
    wheelAngularVelocityEpsilon: 0.0005, // radians/frame: wheel velocity below this snaps to rest.
    millWaterlineOffsetPx: 2, // px: offset for clipping the visible top half of the wheel.
    millHitPaddingPx: 10, // px: extra radial allowance when checking particle overlap against the wheel.
    scrollSensitivityPxPerAngularUnit: 8, // px/frame per radian/frame: scroll distance per unit of wheel spin.
    maxScrollDeltaPxPerFrame: 40, // px/frame: clamp for scroll movement driven by the wheel.
    nativeScrollHintDurationMs: 2000, // ms: visible time for the hint before fade-out begins.
    nativeScrollHintFadeOutMs: 500, // ms: CSS fade-out duration budget for removing the hint class.
    hiddenTabTickMs: 1000 / 30, // ms: fallback delta when resuming after tab visibility changes.
    renderShadowBlurPx: 12, // px: shadow blur applied to water rendering.
    renderParticleOpacity: 0.8, // alpha: opacity of rendered water particles.
    renderSplashRadiusScale: 0.7, // ratio: splash droplet radius relative to water particles.
    supportLineWidthPx: 1, // px: divider line width between content and the column.
    supportLineColor: "rgba(74, 52, 31, 0.22)", // color: divider line color for the column edge.
    collisionWallThicknessPx: 40, // px: thickness of offscreen static containment walls.
    touchHintThresholdPx: 12, // px: vertical swipe threshold before showing the mobile hint.
    wheelHitSidePositive: 1, // sign: clockwise scroll-driving side marker.
    wheelHitSideNegative: -1, // sign: counter-clockwise scroll-driving side marker.
    debugBackgroundAlpha: 0, // alpha: optional debug fill for the canvas background.
  };

  const DEFAULT_OPTIONS = {
    columnWidth: CONFIG.desktopColumnWidthCss,
    smallScreenBreakpoint: CONFIG.smallScreenBreakpointPx,
    scrollSensitivity: CONFIG.scrollSensitivityPxPerAngularUnit,
    maxParticles: CONFIG.maxParticles,
    maxScrollDeltaPerFrame: CONFIG.maxScrollDeltaPxPerFrame,
    wheelPaddleCount: CONFIG.wheelPaddleCount,
    angularDamping: CONFIG.wheelAngularDamping,
    waterColor: "#5aabff",
    woodColor: "#8B5E3C",
    hoseColor: "#4a7c4e",
    hintText: "Drag the hose to scroll",
  };
  const BLOCKED_SCROLL_KEYS = new Set([
    "ArrowDown",
    "ArrowUp",
    "PageDown",
    "PageUp",
    "Home",
    "End",
    "Space",
  ]);

  class WatermillScroll {
    constructor(options = {}) {
      this.options = Object.assign({}, DEFAULT_OPTIONS, options);
      this.options.columnWidth = this.normalizeColumnWidthValue(
        this.options.columnWidth,
      );
      this.assignInitialState();

      if (!this.validateDependencies()) {
        return;
      }

      this.setupDomReferences();
      if (!this.validateDom()) {
        return;
      }

      this.setupCanvas();
      if (!this.context) {
        return;
      }

      this.enableCustomScrollMode();
      this.initialize();
    }

    assignInitialState() {
      this.listeners = [];
      this.pointer = { x: 0, y: 0, active: false };
      this.touchScrollStart = null;
      this.particles = [];
      this.splashes = [];
      this.hoseBodies = [];
      this.hoseConstraints = [];
      this.bounds = [];
      this.rafId = null;
      this.resizeTimer = null;
      this.hintTimer = null;
      this.hintFadeTimer = null;
      this.lastTimestamp = null;
      this.isHolding = false;
      this.isDestroyed = false;
      this.worldReady = false;
      this.isSmallLayout = false;
      this.wheelAngle = 0;
      this.wheelAngularVelocity = 0;
      this.activePointerId = null;
      this.resizeObserver = null;
      this.previousScrollBehavior =
        document.documentElement.style.scrollBehavior;
    }

    validateDependencies() {
      if (!window.Matter) {
        console.error(
          "WatermillScroll requires Matter.js, but window.Matter was not found.",
        );
        return false;
      }

      this.Matter = window.Matter;
      return true;
    }

    setupDomReferences() {
      this.columnElement = document.getElementById("watermill-column");
      this.hintElement = document.getElementById("wm-hint");
      this.layoutContainer =
        document.querySelector(".page-shell") || document.body;
    }

    validateDom() {
      if (!this.columnElement || !this.hintElement) {
        console.error(
          "WatermillScroll requires #watermill-column and #wm-hint elements in the document.",
        );
        return false;
      }

      return true;
    }

    setupCanvas() {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        console.error("WatermillScroll could not acquire a 2D canvas context.");
        return;
      }

      this.canvas = canvas;
      this.context = context;
      this.columnElement.replaceChildren(this.canvas);
      this.syncHintText();
    }

    syncHintText() {
      const textNode = this.hintElement.querySelector("p");
      if (textNode) {
        textNode.textContent = this.options.hintText;
      }
    }

    initialize() {
      this.syncLayoutMode();
      this.buildWorld();
      this.registerCoreListeners();
      this.registerResizeObserver();
      this.startLoop();
    }

    enableCustomScrollMode() {
      document.documentElement.classList.add("watermill-active-root");
      document.body.classList.add("watermill-active");
      document.documentElement.style.scrollBehavior = "auto";
    }

    buildWorld() {
      this.teardownWorld();
      this.measureCanvas();
      this.createEngine();
      this.createBounds();
      this.createHose();
      this.createWheelState();
      this.worldReady = true;
    }

    measureCanvas() {
      const width = this.columnElement.clientWidth;
      const height = this.columnElement.clientHeight;
      const pixelRatio = window.devicePixelRatio || 1;

      this.canvasWidth = width;
      this.canvasHeight = height;
      this.pixelRatio = pixelRatio;
      this.canvas.width = Math.round(width * pixelRatio);
      this.canvas.height = Math.round(height * pixelRatio);
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
      this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    createEngine() {
      const { Engine, Runner } = this.Matter;

      this.engine = Engine.create({
        gravity: { x: 0, y: CONFIG.engineGravityY, scale: 0.001 },
      });
      this.runner = Runner.create();
      this.startPhysicsRunner();
    }

    createBounds() {
      const { Bodies, Composite } = this.Matter;
      const thickness = CONFIG.collisionWallThicknessPx;
      const leftWallX = -thickness / 2;
      const rightWallX = this.canvasWidth + thickness / 2;
      const worldCenterY = this.canvasHeight / 2;

      this.bounds = [
        Bodies.rectangle(
          this.canvasWidth / 2,
          this.canvasHeight + thickness / 2,
          this.canvasWidth,
          thickness,
          { isStatic: true },
        ),
        Bodies.rectangle(
          leftWallX,
          worldCenterY,
          thickness,
          this.canvasHeight * 2,
          { isStatic: true },
        ),
        Bodies.rectangle(
          rightWallX,
          worldCenterY,
          thickness,
          this.canvasHeight * 2,
          { isStatic: true },
        ),
      ];

      Composite.add(this.engine.world, this.bounds);
    }

    createHose() {
      const attachmentPoint = this.getHoseAttachmentPoint();
      const linkSpacing = this.getHoseLinkSpacing();
      const hoseCollisionGroup = this.Matter.Body.nextGroup(true);

      this.hoseBodies = this.createHoseBodies(
        attachmentPoint,
        linkSpacing,
        hoseCollisionGroup,
      );
      this.hoseConstraints = this.createHoseConstraints(
        attachmentPoint,
        linkSpacing,
      );
      this.nozzleBody = this.hoseBodies[this.hoseBodies.length - 1];

      this.Matter.Composite.add(this.engine.world, [
        ...this.hoseBodies,
        ...this.hoseConstraints,
      ]);
    }

    getHoseAttachmentPoint() {
      return { x: this.canvasWidth / 2, y: CONFIG.hoseAttachmentOffsetYPx };
    }

    getHoseLinkSpacing() {
      const defaultReach = this.canvasHeight * CONFIG.hoseDefaultReachRatio;
      return defaultReach / (CONFIG.hoseLinkCount - 1);
    }

    createHoseBodies(attachmentPoint, linkSpacing, collisionGroup) {
      const bodies = [];

      for (let index = 0; index < CONFIG.hoseLinkCount; index += 1) {
        bodies.push(
          this.createSingleHoseBody(
            attachmentPoint,
            linkSpacing,
            index,
            collisionGroup,
          ),
        );
      }

      return bodies;
    }

    createSingleHoseBody(attachmentPoint, linkSpacing, index, collisionGroup) {
      return this.Matter.Bodies.circle(
        attachmentPoint.x,
        attachmentPoint.y + linkSpacing * index,
        CONFIG.hoseLinkRadiusPx,
        {
          frictionAir: CONFIG.hoseLinkAirFriction,
          restitution: CONFIG.hoseLinkRestitution,
          collisionFilter: { group: collisionGroup },
        },
      );
    }

    createHoseConstraints(attachmentPoint, linkSpacing) {
      const constraints = [this.createHoseAnchorConstraint(attachmentPoint)];

      for (let index = 1; index < this.hoseBodies.length; index += 1) {
        constraints.push(this.createHoseLinkConstraint(index, linkSpacing));
      }

      return constraints;
    }

    createHoseAnchorConstraint(attachmentPoint) {
      return this.Matter.Constraint.create({
        pointA: attachmentPoint,
        bodyB: this.hoseBodies[0],
        stiffness: CONFIG.hoseConstraintStiffness,
        damping: CONFIG.hoseConstraintDamping,
        length: 0,
      });
    }

    createHoseLinkConstraint(index, linkSpacing) {
      return this.Matter.Constraint.create({
        bodyA: this.hoseBodies[index - 1],
        bodyB: this.hoseBodies[index],
        stiffness: CONFIG.hoseConstraintStiffness,
        damping: CONFIG.hoseConstraintDamping,
        length: linkSpacing,
      });
    }

    createWheelState() {
      this.wheelRadius = this.getWheelRadius();
      this.wheelPaddleWidth = this.getWheelPaddleWidth();
      this.wheelHubRadius = this.canvasWidth * CONFIG.wheelHubRadiusRatio;
      this.wheelCenter = { x: this.canvasWidth / 2, y: this.canvasHeight };
      this.wheelAngle = 0;
      this.wheelAngularVelocity = 0;
      this.paddleRects = this.buildPaddleGeometry();
    }

    getWheelRadius() {
      const desktopRadius = this.canvasWidth / 2 - CONFIG.wheelPaddingPx;
      if (!this.isSmallLayout) {
        return desktopRadius;
      }

      return desktopRadius * CONFIG.smallScreenWheelRadiusScale;
    }

    getWheelPaddleWidth() {
      const desktopPaddleWidth = this.canvasWidth * CONFIG.wheelPaddleWidthRatio;
      if (!this.isSmallLayout) {
        return desktopPaddleWidth;
      }

      return desktopPaddleWidth * CONFIG.smallScreenWheelPaddleWidthScale;
    }

    buildPaddleGeometry() {
      const paddleLength = this.wheelRadius * CONFIG.wheelPaddleLengthRatio;
      const paddleOffset = this.wheelRadius - paddleLength / 2;
      const paddles = [];

      for (let index = 0; index < this.options.wheelPaddleCount; index += 1) {
        paddles.push({
          baseAngle: (Math.PI * 2 * index) / this.options.wheelPaddleCount,
          width: this.wheelPaddleWidth,
          height: paddleLength,
          offset: paddleOffset,
        });
      }

      return paddles;
    }

    registerCoreListeners() {
      this.registerPointerListeners();
      this.registerNativeScrollBlockers();
      this.addTrackedListener(
        document,
        "visibilitychange",
        this.handleVisibilityChange.bind(this),
      );
    }

    registerPointerListeners() {
      this.addTrackedListener(
        this.canvas,
        "mousedown",
        this.handlePointerStart.bind(this),
      );
      this.addTrackedListener(
        window,
        "mousemove",
        this.handlePointerMove.bind(this),
      );
      this.addTrackedListener(
        window,
        "mouseup",
        this.handlePointerEnd.bind(this),
      );
      this.addTrackedListener(
        this.canvas,
        "touchstart",
        this.handlePointerStart.bind(this),
        { passive: false },
      );
      this.addTrackedListener(
        window,
        "touchmove",
        this.handlePointerMove.bind(this),
        { passive: false },
      );
      this.addTrackedListener(
        window,
        "touchend",
        this.handlePointerEnd.bind(this),
      );
      this.addTrackedListener(
        window,
        "touchcancel",
        this.handlePointerEnd.bind(this),
      );
    }

    registerNativeScrollBlockers() {
      this.addTrackedListener(
        window,
        "wheel",
        this.handleNativeScrollAttempt.bind(this),
        { passive: false },
      );
      this.addTrackedListener(
        window,
        "keydown",
        this.handleKeyScrollAttempt.bind(this),
      );
      this.addTrackedListener(
        window,
        "touchstart",
        this.handleTouchScrollStart.bind(this),
        { passive: true },
      );
      this.addTrackedListener(
        window,
        "touchmove",
        this.handleTouchScrollAttempt.bind(this),
        { passive: false },
      );
      this.addTrackedListener(
        window,
        "touchend",
        this.clearTouchScrollStart.bind(this),
      );
      this.addTrackedListener(
        window,
        "touchcancel",
        this.clearTouchScrollStart.bind(this),
      );
      this.addTrackedListener(
        document,
        "touchmove",
        this.handleDocumentTouchMoveBlocker.bind(this),
        { passive: false },
      );
    }

    registerResizeObserver() {
      this.addTrackedListener(
        window,
        "resize",
        this.scheduleRebuild.bind(this),
      );

      if (!window.ResizeObserver) {
        return;
      }

      this.resizeObserver = new window.ResizeObserver(() =>
        this.scheduleRebuild(),
      );
      this.resizeObserver.observe(this.layoutContainer);
      this.resizeObserver.observe(this.columnElement);
    }

    addTrackedListener(target, type, handler, options) {
      target.addEventListener(type, handler, options);
      this.listeners.push({ target, type, handler, options });
    }

    removeTrackedListeners() {
      for (const listener of this.listeners) {
        listener.target.removeEventListener(
          listener.type,
          listener.handler,
          listener.options,
        );
      }
      this.listeners = [];
    }

    scheduleRebuild() {
      window.clearTimeout(this.resizeTimer);
      this.resizeTimer = window.setTimeout(() => {
        if (this.isDestroyed) {
          return;
        }

        this.syncLayoutMode();
        this.buildWorld();
      }, CONFIG.resizeDebounceMs);
    }

    syncLayoutMode() {
      const nextSmallLayout =
        this.layoutContainer.clientWidth < this.options.smallScreenBreakpoint;

      this.isSmallLayout = nextSmallLayout;
      document.body.classList.toggle("wm-small-layout", nextSmallLayout);
      document.documentElement.style.setProperty(
        "--wm-column-width",
        this.options.columnWidth,
      );
      document.documentElement.style.setProperty(
        "--wm-small-column-width",
        CONFIG.smallScreenColumnWidthCss,
      );
      document.documentElement.style.setProperty(
        "--wm-small-column-height",
        CONFIG.smallScreenColumnHeightCss,
      );
    }

    handleVisibilityChange() {
      if (document.hidden) {
        this.stopPhysicsRunner();
        this.stopLoop();
        return;
      }

      this.lastTimestamp = null;
      this.startPhysicsRunner();
      this.startLoop();
    }

    handlePointerStart(event) {
      if (!this.worldReady || this.activePointerId !== null) {
        return;
      }

      const point = this.getEventPoint(event);
      if (!point || !this.isNearNozzle(point)) {
        return;
      }

      event.preventDefault();
      this.startHolding(point, event);
    }

    isNearNozzle(point) {
      const nozzle = this.nozzleBody.position;
      return (
        Math.hypot(point.x - nozzle.x, point.y - nozzle.y) <=
        CONFIG.nozzleGrabRadiusPx
      );
    }

    startHolding(point, event) {
      this.isHolding = true;
      this.pointer.active = true;
      this.pointer.x = point.x;
      this.pointer.y = point.y;
      this.activePointerId = this.getPointerIdentifier(event);
    }

    getPointerIdentifier(event) {
      if ("changedTouches" in event && event.changedTouches[0]) {
        return event.changedTouches[0].identifier;
      }

      return "mouse";
    }

    handlePointerMove(event) {
      if (!this.isHolding) {
        return;
      }

      const point = this.getEventPoint(event);
      if (!point) {
        return;
      }

      if ("touches" in event) {
        event.preventDefault();
      }

      this.pointer.x = point.x;
      this.pointer.y = point.y;
    }

    handlePointerEnd(event) {
      if (!this.isHolding || !this.isMatchingPointerEnd(event)) {
        return;
      }

      this.releasePointer();
    }

    isMatchingPointerEnd(event) {
      if (!("changedTouches" in event) || this.activePointerId === null) {
        return true;
      }

      return Array.from(event.changedTouches).some(
        (touch) => touch.identifier === this.activePointerId,
      );
    }

    handleNativeScrollAttempt(event) {
      event.preventDefault();
      this.showHint();
    }

    handleKeyScrollAttempt(event) {
      if (!BLOCKED_SCROLL_KEYS.has(event.code)) {
        return;
      }

      event.preventDefault();
      this.showHint();
    }

    handleTouchScrollStart(event) {
      if (!event.touches[0]) {
        return;
      }

      this.touchScrollStart = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    }

    handleTouchScrollAttempt(event) {
      if (this.isHolding || !this.touchScrollStart || !event.touches[0]) {
        return;
      }

      const deltaY = event.touches[0].clientY - this.touchScrollStart.y;
      if (Math.abs(deltaY) < CONFIG.touchHintThresholdPx) {
        return;
      }

      event.preventDefault();
      this.showHint();
    }

    handleDocumentTouchMoveBlocker(event) {
      if (!document.body.classList.contains("watermill-active")) {
        return;
      }

      if (event.cancelable) {
        event.preventDefault();
      }
    }

    clearTouchScrollStart() {
      this.touchScrollStart = null;
    }

    releasePointer() {
      this.isHolding = false;
      this.pointer.active = false;
      this.activePointerId = null;
    }

    showHint() {
      this.hintElement.classList.add("visible");
      window.clearTimeout(this.hintTimer);
      window.clearTimeout(this.hintFadeTimer);
      this.hintTimer = window.setTimeout(
        () => this.hideHint(),
        CONFIG.nativeScrollHintDurationMs,
      );
    }

    hideHint() {
      this.hintElement.classList.remove("visible");
      this.hintFadeTimer = window.setTimeout(() => {
        this.hintFadeTimer = null;
      }, CONFIG.nativeScrollHintFadeOutMs);
    }

    getEventPoint(event) {
      const source = this.getPointerSource(event);
      if (!source) {
        return null;
      }

      const rect = this.canvas.getBoundingClientRect();
      return {
        x: source.clientX - rect.left,
        y: source.clientY - rect.top,
      };
    }

    getPointerSource(event) {
      if (!("touches" in event)) {
        return event;
      }

      const activeTouch = Array.from(event.touches).find(
        (touch) => touch.identifier === this.activePointerId,
      );
      return activeTouch || event.touches[0] || event.changedTouches[0] || null;
    }

    startLoop() {
      if (this.rafId !== null || this.isDestroyed) {
        return;
      }

      const frame = (timestamp) => {
        if (this.isDestroyed) {
          return;
        }

        this.rafId = window.requestAnimationFrame(frame);
        this.updateFrame(timestamp);
      };

      this.rafId = window.requestAnimationFrame(frame);
    }

    stopLoop() {
      if (this.rafId === null) {
        return;
      }

      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    updateFrame(timestamp) {
      if (!this.worldReady) {
        return;
      }

      const deltaMs = this.getFrameDelta(timestamp);
      this.lastTimestamp = timestamp;

      this.updateNozzleDrag();
      this.emitParticles();
      this.sweepParticles(timestamp);
      this.updateSplashes(deltaMs);
      this.updateWheelAndScroll();
      this.renderScene();
    }

    getFrameDelta(timestamp) {
      if (this.lastTimestamp === null) {
        return CONFIG.hiddenTabTickMs;
      }

      return Math.min(
        timestamp - this.lastTimestamp,
        CONFIG.hiddenTabTickMs * 2,
      );
    }

    updateNozzleDrag() {
      if (!this.isHolding || !this.pointer.active) {
        return;
      }

      const clampedPoint = this.clampPointerToColumn(this.pointer);
      this.Matter.Body.setPosition(this.nozzleBody, clampedPoint);
      this.Matter.Body.setVelocity(this.nozzleBody, { x: 0, y: 0 });
      this.Matter.Body.setAngularVelocity(this.nozzleBody, 0);
    }

    clampPointerToColumn(point) {
      const minX = CONFIG.nozzleHorizontalPaddingPx;
      const maxX = this.canvasWidth - CONFIG.nozzleHorizontalPaddingPx;
      const maxY =
        this.canvasHeight - this.wheelRadius - CONFIG.nozzleBottomClearancePx;

      return {
        x: this.clamp(point.x, minX, maxX),
        y: this.clamp(point.y, 0, maxY),
      };
    }

    emitParticles() {
      if (!this.isHolding) {
        return;
      }

      const particlesPerFrame = this.getEmissionCount();
      const nozzleAngle = this.getNozzleAngle();

      for (let index = 0; index < particlesPerFrame; index += 1) {
        this.createParticle(nozzleAngle);
      }

      this.trimParticleOverflow();
    }

    getEmissionCount() {
      const depthRatio = this.getNozzleDepthRatio();
      const emissionScale = this.isSmallLayout
        ? CONFIG.smallScreenEmissionScale
        : 1;
      const rawCount = this.interpolate(
        CONFIG.emissionMinParticlesPerFrame,
        CONFIG.emissionMaxParticlesPerFrame,
        depthRatio,
      );
      return Math.max(
        CONFIG.emissionMinParticlesPerFrame,
        Math.round(rawCount * emissionScale),
      );
    }

    getNozzleDepthRatio() {
      return this.nozzleBody.position.y / this.canvasHeight;
    }

    getNozzleAngle() {
      const previousLink = this.hoseBodies[this.hoseBodies.length - 2];
      const nozzleLink = this.nozzleBody;
      const deltaX = nozzleLink.position.x - previousLink.position.x;
      const deltaY = nozzleLink.position.y - previousLink.position.y;

      if (Math.abs(deltaX) <= CONFIG.nozzleVerticalSnapThresholdPx) {
        return Math.PI / 2;
      }

      // Use the final hose segment as the nozzle direction so the spray follows the chain's physical bend.
      return this.getClampedNozzleAngle(Math.atan2(deltaY, deltaX));
    }

    getClampedNozzleAngle(rawAngle) {
      const verticalAngle = Math.PI / 2;
      const deflectionFromVertical = this.clamp(
        rawAngle - verticalAngle,
        -CONFIG.nozzleMaxDeflectionFromVerticalRadians,
        CONFIG.nozzleMaxDeflectionFromVerticalRadians,
      );

      return verticalAngle + deflectionFromVertical;
    }

    createParticle(nozzleAngle) {
      const particle = this.buildParticleBody();
      const velocity = this.getParticleVelocity(nozzleAngle);

      this.Matter.Body.setVelocity(particle, velocity);
      particle.plugin.watermill = { bornAt: performance.now(), hitMill: false };
      this.particles.push(particle);
      this.Matter.Composite.add(this.engine.world, particle);
    }

    buildParticleBody() {
      return this.Matter.Bodies.circle(
        this.nozzleBody.position.x,
        this.nozzleBody.position.y,
        CONFIG.particleRadiusPx,
        {
          frictionAir: CONFIG.particleAirFriction,
          restitution: CONFIG.particleRestitution,
          density: CONFIG.particleDensity,
        },
      );
    }

    getParticleVelocity(nozzleAngle) {
      const sprayAngle =
        nozzleAngle +
        this.randomRange(
          -CONFIG.emissionSpreadRadians,
          CONFIG.emissionSpreadRadians,
        );
      const depthScale = this.interpolate(
        CONFIG.nozzleSpeedMinDepthScale,
        CONFIG.nozzleSpeedMaxDepthScale,
        this.getNozzleDepthRatio(),
      );
      const speed = CONFIG.nozzleStreamSpeedPxPerFrame * depthScale;

      return {
        x: Math.cos(sprayAngle) * speed,
        y: Math.sin(sprayAngle) * speed,
      };
    }

    trimParticleOverflow() {
      while (this.particles.length > this.options.maxParticles) {
        this.removeParticle(this.particles[0]);
      }
    }

    sweepParticles(timestamp) {
      for (const particle of [...this.particles]) {
        if (this.shouldCullParticleByAge(particle, timestamp)) {
          this.removeParticle(particle);
          continue;
        }

        if (this.tryMillHit(particle)) {
          continue;
        }

        if (this.isSettledAtBottom(particle)) {
          this.removeParticle(particle);
        }
      }
    }

    shouldCullParticleByAge(particle, timestamp) {
      return (
        timestamp - particle.plugin.watermill.bornAt > CONFIG.particleLifetimeMs
      );
    }

    tryMillHit(particle) {
      if (
        particle.plugin.watermill.hitMill ||
        !this.isParticleNearMill(particle)
      ) {
        return false;
      }

      const hit = this.detectMillHit(particle);
      if (!hit) {
        return false;
      }

      const speed = Math.hypot(particle.velocity.x, particle.velocity.y);
      particle.plugin.watermill.hitMill = true;
      this.applyMillImpulse(hit.side, speed);
      this.maybeSpawnImpactSplash(particle, hit.side, speed);
      this.removeParticle(particle);
      return true;
    }

    isParticleNearMill(particle) {
      const millTopY =
        this.canvasHeight - CONFIG.millWaterlineOffsetPx - this.wheelRadius;
      return particle.position.y >= millTopY;
    }

    detectMillHit(particle) {
      if (!this.isInsideWheelArc(particle)) {
        return null;
      }

      for (const paddle of this.paddleRects) {
        if (this.isInsidePaddle(particle, paddle)) {
          return { side: this.getWheelHitSide(particle.position.x) };
        }
      }

      return null;
    }

    isInsideWheelArc(particle) {
      const dx = particle.position.x - this.wheelCenter.x;
      const dy = particle.position.y - this.wheelCenter.y;
      const radialDistance = Math.hypot(dx, dy);
      const maxDistance =
        this.wheelRadius + CONFIG.particleRadiusPx + CONFIG.millHitPaddingPx;
      return (
        radialDistance <= maxDistance &&
        particle.position.y <= this.wheelCenter.y
      );
    }

    isInsidePaddle(particle, paddle) {
      const center = this.getPaddleCenter(paddle);
      return this.pointInsideRotatedRect(
        particle.position.x,
        particle.position.y,
        center.x,
        center.y,
        paddle.width,
        paddle.height,
        paddle.baseAngle + this.wheelAngle,
      );
    }

    getPaddleCenter(paddle) {
      const angle = paddle.baseAngle + this.wheelAngle;
      return {
        x: this.wheelCenter.x + Math.cos(angle) * paddle.offset,
        y: this.wheelCenter.y + Math.sin(angle) * paddle.offset,
      };
    }

    getWheelHitSide(xPosition) {
      return xPosition >= this.wheelCenter.x
        ? CONFIG.wheelHitSidePositive
        : CONFIG.wheelHitSideNegative;
    }

    pointInsideRotatedRect(pointX, pointY, rectX, rectY, width, height, angle) {
      const translatedX = pointX - rectX;
      const translatedY = pointY - rectY;
      const cosine = Math.cos(-angle);
      const sine = Math.sin(-angle);
      const localX = translatedX * cosine - translatedY * sine;
      const localY = translatedX * sine + translatedY * cosine;

      return Math.abs(localX) <= width / 2 && Math.abs(localY) <= height / 2;
    }

    applyMillImpulse(side, speed) {
      this.wheelAngularVelocity += side * speed * CONFIG.wheelImpulseFactor;
    }

    maybeSpawnImpactSplash(particle, side, speed) {
      if (speed < CONFIG.splashImpactThresholdPxPerFrame) {
        return;
      }

      this.spawnSplashes(particle.position.x, particle.position.y, side);
    }

    spawnSplashes(originX, originY, side) {
      const splashCount = Math.round(
        this.randomRange(
          CONFIG.splashParticleMinCount,
          CONFIG.splashParticleMaxCount,
        ),
      );

      for (let index = 0; index < splashCount; index += 1) {
        this.splashes.push(this.createSplash(originX, originY, side));
      }
    }

    createSplash(originX, originY, side) {
      const angle =
        this.randomRange(
          CONFIG.splashArcMinRadians,
          CONFIG.splashArcMaxRadians,
        ) +
        side * CONFIG.splashSideBiasRadians;
      const speed = this.randomRange(
        CONFIG.splashSpeedPxPerMs * CONFIG.splashSpeedMinScale,
        CONFIG.splashSpeedPxPerMs * CONFIG.splashSpeedMaxScale,
      );

      return {
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        bornAt: performance.now(),
      };
    }

    isSettledAtBottom(particle) {
      const nearBottomY = this.canvasHeight - CONFIG.particleRadiusPx * 2;
      const speed = Math.hypot(particle.velocity.x, particle.velocity.y);
      return (
        particle.position.y >= nearBottomY &&
        speed <= CONFIG.particleRestSpeedPxPerFrame
      );
    }

    updateSplashes(deltaMs) {
      const now = performance.now();
      this.splashes = this.splashes.filter((splash) =>
        this.advanceSplash(splash, deltaMs, now),
      );
    }

    advanceSplash(splash, deltaMs, now) {
      if (now - splash.bornAt > CONFIG.splashLifetimeMs) {
        return false;
      }

      splash.vy += CONFIG.splashGravityPxPerMs2 * deltaMs;
      splash.x += splash.vx * deltaMs;
      splash.y += splash.vy * deltaMs;
      return true;
    }

    updateWheelAndScroll() {
      this.advanceWheel();

      const scrollDelta = this.getScrollDeltaFromWheel();
      if (scrollDelta === 0) {
        return;
      }

      const nextScrollTop = this.getClampedScrollTop(scrollDelta);
      window.scrollTo(0, nextScrollTop);
    }

    advanceWheel() {
      this.wheelAngle += this.wheelAngularVelocity;
      this.wheelAngularVelocity *= this.options.angularDamping;

      if (
        Math.abs(this.wheelAngularVelocity) < CONFIG.wheelAngularVelocityEpsilon
      ) {
        this.wheelAngularVelocity = 0;
      }
    }

    getScrollDeltaFromWheel() {
      // Wheel spin becomes scroll distance here so the mechanical state, not pointer motion, drives page movement.
      const rawDelta =
        this.wheelAngularVelocity * this.options.scrollSensitivity;
      return this.clamp(
        rawDelta,
        -this.options.maxScrollDeltaPerFrame,
        this.options.maxScrollDeltaPerFrame,
      );
    }

    getClampedScrollTop(scrollDelta) {
      const maxScrollTop = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      return this.clamp(window.scrollY + scrollDelta, 0, maxScrollTop);
    }

    renderScene() {
      const ctx = this.context;

      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.renderDebugBackground(ctx);
      this.renderColumnDivider(ctx);
      this.renderHose(ctx);
      this.renderParticles(ctx);
      this.renderWheel(ctx);
      this.renderSplashes(ctx);
    }

    renderDebugBackground(ctx) {
      if (CONFIG.debugBackgroundAlpha <= 0) {
        return;
      }

      ctx.fillStyle = `rgba(0, 0, 0, ${CONFIG.debugBackgroundAlpha})`;
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    renderColumnDivider(ctx) {
      ctx.save();
      ctx.strokeStyle = CONFIG.supportLineColor;
      ctx.lineWidth = CONFIG.supportLineWidthPx;
      ctx.beginPath();
      ctx.moveTo(CONFIG.supportLineWidthPx / 2, 0);
      ctx.lineTo(CONFIG.supportLineWidthPx / 2, this.canvasHeight);
      ctx.stroke();
      ctx.restore();
    }

    renderHose(ctx) {
      const points = this.hoseBodies.map((body) => body.position);
      const finalPoint = points[points.length - 1];

      ctx.save();
      this.strokeHosePath(ctx, points);
      this.renderNozzleCap(ctx, finalPoint);
      ctx.restore();
    }

    strokeHosePath(ctx, points) {
      ctx.strokeStyle = this.options.hoseColor;
      ctx.lineWidth = CONFIG.hoseRenderWidthPx;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let index = 1; index < points.length - 1; index += 1) {
        const midpointX = (points[index].x + points[index + 1].x) / 2;
        const midpointY = (points[index].y + points[index + 1].y) / 2;
        ctx.quadraticCurveTo(
          points[index].x,
          points[index].y,
          midpointX,
          midpointY,
        );
      }

      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.stroke();
    }

    renderNozzleCap(ctx, finalPoint) {
      ctx.translate(finalPoint.x, finalPoint.y);
      ctx.rotate(this.getNozzleAngle());
      ctx.fillStyle = "#2f3d2c";
      ctx.fillRect(
        -CONFIG.nozzleCapRearOffsetPx,
        -CONFIG.hoseRenderWidthPx / 2,
        CONFIG.nozzleCapLengthPx,
        CONFIG.hoseRenderWidthPx,
      );
    }

    renderParticles(ctx) {
      ctx.save();
      ctx.fillStyle = this.options.waterColor;
      ctx.globalAlpha = CONFIG.renderParticleOpacity;
      ctx.shadowColor = "rgba(90, 171, 255, 0.35)";
      ctx.shadowBlur = CONFIG.renderShadowBlurPx;
      for (const particle of this.particles) {
        ctx.beginPath();
        ctx.arc(
          particle.position.x,
          particle.position.y,
          CONFIG.particleRadiusPx,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      ctx.restore();
    }

    renderWheel(ctx) {
      ctx.save();
      this.clipToVisibleWheelHalf(ctx);

      for (const paddle of this.paddleRects) {
        this.drawPaddle(ctx, paddle);
      }

      this.drawWheelHub(ctx);
      ctx.restore();
    }

    clipToVisibleWheelHalf(ctx) {
      ctx.beginPath();
      ctx.rect(
        0,
        0,
        this.canvasWidth,
        this.canvasHeight - CONFIG.millWaterlineOffsetPx,
      );
      ctx.clip();
    }

    drawPaddle(ctx, paddle) {
      const center = this.getPaddleCenter(paddle);
      const angle = paddle.baseAngle + this.wheelAngle;

      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.rotate(angle);
      ctx.fillStyle = this.options.woodColor;
      this.fillRoundedRect(
        ctx,
        -paddle.width / 2,
        -paddle.height / 2,
        paddle.width,
        paddle.height,
        CONFIG.wheelPaddleCornerRadiusPx,
      );
      ctx.restore();
    }

    drawWheelHub(ctx) {
      ctx.fillStyle = "#6b3f1f";
      ctx.beginPath();
      ctx.arc(
        this.wheelCenter.x,
        this.wheelCenter.y,
        this.wheelHubRadius,
        Math.PI,
        Math.PI * 2,
      );
      ctx.fill();
    }

    renderSplashes(ctx) {
      const now = performance.now();

      ctx.save();
      ctx.fillStyle = this.options.waterColor;

      for (const splash of this.splashes) {
        const ageRatio = (now - splash.bornAt) / CONFIG.splashLifetimeMs;
        ctx.globalAlpha = Math.max(0, 1 - ageRatio);
        ctx.beginPath();
        ctx.arc(
          splash.x,
          splash.y,
          CONFIG.particleRadiusPx * CONFIG.renderSplashRadiusScale,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      ctx.restore();
    }

    removeParticle(particle) {
      this.particles = this.particles.filter((entry) => entry !== particle);
      this.Matter.Composite.remove(this.engine.world, particle);
    }

    teardownWorld() {
      if (!this.engine) {
        return;
      }

      this.Matter.Composite.clear(this.engine.world, false);
      this.Matter.Engine.clear(this.engine);
      this.stopPhysicsRunner();

      this.engine = null;
      this.runner = null;
      this.bounds = [];
      this.hoseBodies = [];
      this.hoseConstraints = [];
      this.nozzleBody = null;
      this.particles = [];
      this.splashes = [];
      this.worldReady = false;
    }

    destroy() {
      this.isDestroyed = true;
      this.releasePointer();
      this.stopLoop();
      this.removeTrackedListeners();
      this.disconnectResizeObserver();
      this.teardownWorld();
      this.clearTimers();
      this.resetDocumentState();
      this.removeCanvas();
    }

    disconnectResizeObserver() {
      if (!this.resizeObserver) {
        return;
      }

      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    clearTimers() {
      window.clearTimeout(this.resizeTimer);
      window.clearTimeout(this.hintTimer);
      window.clearTimeout(this.hintFadeTimer);
    }

    resetDocumentState() {
      document.documentElement.classList.remove("watermill-active-root");
      document.body.classList.remove("watermill-active", "wm-small-layout");
      document.documentElement.style.scrollBehavior =
        this.previousScrollBehavior;
    }

    removeCanvas() {
      if (this.canvas && this.canvas.parentNode === this.columnElement) {
        this.columnElement.removeChild(this.canvas);
      }
    }

    normalizeColumnWidthValue(columnWidth) {
      return typeof columnWidth === "number" ? `${columnWidth}px` : columnWidth;
    }

    startPhysicsRunner() {
      if (!this.runner || !this.engine) {
        return;
      }

      this.Matter.Runner.run(this.runner, this.engine);
    }

    stopPhysicsRunner() {
      if (!this.runner) {
        return;
      }

      this.Matter.Runner.stop(this.runner);
    }

    interpolate(start, end, ratio) {
      return start + (end - start) * this.clamp(ratio, 0, 1);
    }

    clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    randomRange(min, max) {
      return min + Math.random() * (max - min);
    }

    fillRoundedRect(ctx, x, y, width, height, radius) {
      if (typeof ctx.roundRect === "function") {
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        ctx.fill();
        return;
      }

      const clampedRadius = Math.min(radius, width / 2, height / 2);

      ctx.beginPath();
      ctx.moveTo(x + clampedRadius, y);
      ctx.lineTo(x + width - clampedRadius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + clampedRadius);
      ctx.lineTo(x + width, y + height - clampedRadius);
      ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - clampedRadius,
        y + height,
      );
      ctx.lineTo(x + clampedRadius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - clampedRadius);
      ctx.lineTo(x, y + clampedRadius);
      ctx.quadraticCurveTo(x, y, x + clampedRadius, y);
      ctx.fill();
    }
  }

  window.WatermillScroll = WatermillScroll;
})();
