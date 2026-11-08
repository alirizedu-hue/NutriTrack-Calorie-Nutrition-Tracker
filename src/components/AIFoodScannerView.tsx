import React, { useState, useRef, useEffect } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { AIScanResult, AIScanItem, MealCategory, FoodCategory } from '../types/nutrition';
import {
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Plus,
  Flame,
  ArrowRight,
  ChevronRight,
  SwitchCamera,
  Eye,
  Info,
  Check,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Video
} from 'lucide-react';

export const AIFoodScannerView: React.FC = () => {
  const { addBatchFoodLogEntries, saveScannedMeal, selectedDate, setActiveTab, addToast } = useNutrition();
  const [isSavingMeal, setIsSavingMeal] = useState(false);


  // Camera & Image states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  const [diagInfo, setDiagInfo] = useState<{
    isSecureContext: boolean;
    isInIframe: boolean;
    permissionStatus: string;
    hasMediaDevices: boolean;
    trackLabel?: string;
    trackReadyState?: string;
    videoWidth?: number;
    videoHeight?: number;
  }>({
    isSecureContext: typeof window !== 'undefined' ? window.isSecureContext : false,
    isInIframe: typeof window !== 'undefined' ? window.self !== window.top : false,
    permissionStatus: 'unknown',
    hasMediaDevices: typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia),
  });

  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<AIScanResult | null>(null);

  // Editable review states
  const [editableItems, setEditableItems] = useState<AIScanItem[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<MealCategory>('lunch');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Diagnostics inspector
  const updateDiagnostics = async () => {
    let perm = 'unknown';
    try {
      if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
        const p = await navigator.permissions.query({ name: 'camera' as any });
        perm = p.state;
      }
    } catch {
      perm = 'unsupported';
    }

    const inIframe = typeof window !== 'undefined' ? window.self !== window.top : false;
    setIsInIframe(inIframe);

    const track = streamRef.current?.getVideoTracks()[0];
    const video = videoRef.current;

    setDiagInfo({
      isSecureContext: typeof window !== 'undefined' ? window.isSecureContext : false,
      isInIframe: inIframe,
      permissionStatus: perm,
      hasMediaDevices: typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia),
      trackLabel: track?.label,
      trackReadyState: track?.readyState,
      videoWidth: video?.videoWidth,
      videoHeight: video?.videoHeight,
    });
  };

  useEffect(() => {
    updateDiagnostics();
  }, []);

  const openStandaloneTab = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
    }
  };

  // Attach stream to video with full Android Chrome attribute enforcement
  const attachStreamToVideo = async (video: HTMLVideoElement, stream: MediaStream) => {
    // Critical properties for Android Chrome inline playback
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.autoplay = true;

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    try {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (err: any) {
      console.warn('[Camera] video.play() note:', err?.message || err);
    }
  };

  // Initialize camera stream with 3-tier progressive Android fallbacks
  const startCamera = async (facing: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraError(null);
    setIsStartingCamera(true);
    setIsVideoReady(false);
    setVideoDimensions({ width: 0, height: 0 });

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setCameraError('Camera access requires a secure context (HTTPS). Please open this app directly in a secure standalone tab.');
      setIsStartingCamera(false);
      updateDiagnostics();
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser environment. You can upload any food picture from your gallery.');
      setIsStartingCamera(false);
      updateDiagnostics();
      return;
    }

    let stream: MediaStream | null = null;

    // Strategy 1: Ideal facingMode + ideal resolution (optimal for food framing)
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch (err1: any) {
      console.warn('[Camera] Strategy 1 failed, trying facingMode only fallback:', err1?.message || err1);

      // Strategy 2: Ideal facingMode only (resolves Android driver constraints)
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
          },
          audio: false,
        });
      } catch (err2: any) {
        console.warn('[Camera] Strategy 2 failed, trying basic video constraint fallback:', err2?.message || err2);

        // Strategy 3: Basic video constraint (maximum device compatibility)
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (err3: any) {
          console.error('[Camera] All getUserMedia strategies failed:', err3);
          let msg = 'Unable to access camera. Please allow camera permissions or upload a food photo from your gallery.';
          if (err3.name === 'NotAllowedError' || err3.name === 'PermissionDeniedError') {
            msg = 'Camera permission was denied. Please grant camera access in your browser address bar / site settings.';
          } else if (err3.name === 'NotFoundError' || err3.name === 'DevicesNotFoundError') {
            msg = 'No camera hardware detected on this device. You can upload any food picture directly.';
          } else if (err3.name === 'NotReadableError' || err3.name === 'TrackStartError') {
            msg = 'Camera is currently locked by another application or tab. Please close other camera apps and retry.';
          } else if (err3.name === 'OverconstrainedError') {
            msg = 'Requested camera resolution constraint is not supported by your camera hardware.';
          }
          setCameraError(msg);
          setIsStartingCamera(false);
          setIsCameraActive(false);
          updateDiagnostics();
          return;
        }
      }
    }

    if (!stream) {
      setCameraError('Failed to acquire camera stream.');
      setIsStartingCamera(false);
      updateDiagnostics();
      return;
    }

    // Verify stream tracks
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) {
      setCameraError('Camera stream contains zero active video tracks.');
      setIsStartingCamera(false);
      updateDiagnostics();
      return;
    }

    videoTracks[0].enabled = true;
    streamRef.current = stream;

    // Activate camera mode
    setIsCameraActive(true);
    setCapturedImage(null);
    setScanResult(null);
    setAnalysisError(null);

    // Attach stream to permanent video element
    const video = videoRef.current;
    if (video) {
      await attachStreamToVideo(video, stream);
    }

    setIsStartingCamera(false);
    updateDiagnostics();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('[Camera] Track stop error:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsVideoReady(false);
    setIsStartingCamera(false);
    setVideoDimensions({ width: 0, height: 0 });
    updateDiagnostics();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Monitor video element events and dimension changes to confirm active frames
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkDimensions = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setVideoDimensions({
          width: video.videoWidth,
          height: video.videoHeight,
        });
        setIsVideoReady(true);
        updateDiagnostics();
      }
    };

    const handleLoadedMetadata = () => {
      checkDimensions();
      if (video.paused && isCameraActive) {
        video.play().catch((e) => console.warn('[Camera] Metadata play catch:', e));
      }
    };

    const handleCanPlay = () => {
      checkDimensions();
      if (video.paused && isCameraActive) {
        video.play().catch((e) => console.warn('[Camera] CanPlay play catch:', e));
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', checkDimensions);
    video.addEventListener('timeupdate', checkDimensions);

    // Ensure attachment if stream was loaded
    if (isCameraActive && streamRef.current && video.srcObject !== streamRef.current) {
      attachStreamToVideo(video, streamRef.current);
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', checkDimensions);
      video.removeEventListener('timeupdate', checkDimensions);
    };
  }, [isCameraActive]);

  // Toggle front/back camera
  const toggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  // Capture frame from video feed
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) {
      addToast('Camera Error', 'Camera feed is not available.', 'error');
      return;
    }

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setCapturedImage(dataUrl);
    stopCamera();
    setScanResult(null);
    setAnalysisError(null);
    addToast('Photo Captured', 'Click "Analyze Meal with AI" to recognize ingredients and estimate calories.', 'success');
  };

  // Handle gallery file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Invalid File', 'Please select an image file (JPEG, PNG, WEBP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCapturedImage(result);
      stopCamera();
      setScanResult(null);
      setAnalysisError(null);
    };
    reader.readAsDataURL(file);
  };

  // Load sample image for instant demo
  const handleLoadSample = async (sampleUrl: string) => {
    stopCamera();
    try {
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setScanResult(null);
        setAnalysisError(null);
        addToast('Sample Meal Loaded', 'Click "Analyze Meal with AI" to recognize ingredients.', 'info');
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.warn('Could not fetch sample image as blob, setting direct URL:', err);
      setCapturedImage(sampleUrl);
      setScanResult(null);
      setAnalysisError(null);
    }
  };

  // Analyze meal with AI
  const analyzeMeal = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // Ensure capturedImage is always base64 data URL
      let base64Payload = capturedImage;
      if (!capturedImage.startsWith('data:')) {
        const res = await fetch(capturedImage);
        const blob = await res.blob();
        base64Payload = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
      }

      const mimeType = base64Payload.startsWith('data:image/png')
        ? 'image/png'
        : base64Payload.startsWith('data:image/webp')
        ? 'image/webp'
        : 'image/jpeg';

      const response = await fetch('/api/scan-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Payload,
          mimeType,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to analyze meal image.');
      }

      const result: AIScanResult = json.data;

      if (!result.isFood) {
        setScanResult(result);
        setAnalysisError(
          result.clarificationMessage ||
            'The AI could not confidently detect food in this photo. Please retake with clearer lighting or adjust the camera angle.'
        );
        setIsAnalyzing(false);
        return;
      }

      // Map from structured foods or items
      const sourceFoods = Array.isArray(result.foods) && result.foods.length > 0 ? result.foods : result.items || [];

      const mappedItems: AIScanItem[] = sourceFoods.map((it: any, idx: number) => {
        const weight = Math.max(5, Number(it.estimated_weight_grams || it.servingSize) || 100);
        const cal = Number(it.calories) || 0;
        const prot = Number(it.protein) || 0;
        const carb = Number(it.carbohydrates ?? it.carbs) || 0;
        const ft = Number(it.fat) || 0;
        const fib = Number(it.fiber) || 0;

        return {
          id: `scan-item-${Date.now()}-${idx}`,
          name: it.name,
          category: (it.category as FoodCategory) || 'Prepared',
          servingSize: weight,
          servingUnit: 'g',
          estimated_weight_grams: weight,
          calories: cal,
          protein: prot,
          carbs: carb,
          carbohydrates: carb,
          fat: ft,
          fiber: fib,
          confidence: it.confidence || 'medium',
          groundedInDb: it.groundedInDb ?? true,
        };
      });

      setScanResult(result);
      setEditableItems(mappedItems);

      if (result.suggestedMealType) {
        setSelectedMealType(result.suggestedMealType);
      }

      addToast(
        'Meal Recognized!',
        `Identified ${mappedItems.length} food items (${result.total_calories || result.totalCalories || 0} kcal estimated).`,
        'success'
      );
    } catch (err: any) {
      console.error('Scan error:', err);
      setAnalysisError(
        err.message ||
          'Failed to reach nutrition recognition model. Please verify your GEMINI_API_KEY in Settings > Secrets or check connection.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Item adjustments with dynamic recalculation when weight changes
  const handleUpdateItem = (id: string, field: keyof AIScanItem, val: any) => {
    setEditableItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (field === 'servingSize' || field === 'estimated_weight_grams') {
          const newWeight = Math.max(1, Number(val) || 1);
          const oldWeight = Math.max(1, Number(item.estimated_weight_grams || item.servingSize) || 1);
          const ratio = newWeight / oldWeight;

          return {
            ...item,
            servingSize: newWeight,
            estimated_weight_grams: newWeight,
            calories: Math.max(0, Math.round(item.calories * ratio)),
            protein: Math.max(0, Math.round(item.protein * ratio * 10) / 10),
            carbs: Math.max(0, Math.round(item.carbs * ratio * 10) / 10),
            carbohydrates: Math.max(0, Math.round(item.carbs * ratio * 10) / 10),
            fat: Math.max(0, Math.round(item.fat * ratio * 10) / 10),
            fiber: Math.max(0, Math.round(item.fiber * ratio * 10) / 10),
          };
        }

        return { ...item, [field]: val };
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setEditableItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddNewItem = () => {
    const newItem: AIScanItem = {
      id: `custom-scan-${Date.now()}`,
      name: 'Additional Item',
      category: 'Prepared',
      servingSize: 100,
      servingUnit: 'g',
      calories: 120,
      protein: 5,
      carbs: 15,
      fat: 3,
      fiber: 2,
      confidence: 100,
    };
    setEditableItems((prev) => [...prev, newItem]);
    setEditingItemId(newItem.id);
  };

  // Recalculated totals from editable items
  const totalCalories = editableItems.reduce((acc, it) => acc + (Number(it.calories) || 0), 0);
  const totalProtein = Math.round(editableItems.reduce((acc, it) => acc + (Number(it.protein) || 0), 0) * 10) / 10;
  const totalCarbs = Math.round(editableItems.reduce((acc, it) => acc + (Number(it.carbs) || 0), 0) * 10) / 10;
  const totalFat = Math.round(editableItems.reduce((acc, it) => acc + (Number(it.fat) || 0), 0) * 10) / 10;
  const totalFiber = Math.round(editableItems.reduce((acc, it) => acc + (Number(it.fiber) || 0), 0) * 10) / 10;

  // Add all detected items into the daily food diary & meal history
  const handleAddToDiary = () => {
    if (isSavingMeal) return;
    if (editableItems.length === 0) {
      addToast('No Items', 'No food items are listed to add.', 'error');
      return;
    }

    setIsSavingMeal(true);

    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const mealTitle =
        scanResult?.mealOverview ||
        (editableItems[0]?.name ? `${editableItems[0].name} Plate` : 'Scanned Meal Plate');

      // 1. Save to Scanned Meal History
      const savedMeal = saveScannedMeal({
        name: mealTitle,
        timestamp: timeStr,
        date: selectedDate,
        imageUrl: capturedImage || '',
        mealType: selectedMealType,
        items: editableItems,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        totalFiber,
        confidenceLevel: scanResult?.confidenceLevel || 'high',
        nutritionalNotes: scanResult?.nutritionalNotes,
        addedToDiary: true,
      });

      // 2. Batch save into Daily Food Diary with image attachment
      addBatchFoodLogEntries(
        editableItems.map((item) => ({
          foodName: item.name,
          category: item.category,
          servingSize: item.servingSize,
          servingUnit: item.servingUnit,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          fiber: item.fiber,
        })),
        selectedMealType,
        capturedImage || undefined,
        savedMeal.id
      );

      // 3. Navigate to Food Diary
      setActiveTab('diary');
    } catch (err: any) {
      console.error('Failed to save scanned meal:', err);
      addToast('Save Failed', 'Could not save meal. Please try again.', 'error');
    } finally {
      setIsSavingMeal(false);
    }
  };


  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini Vision Multimodal Recognition</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI Food & Meal Scanner
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Snap a photo of your meal to automatically recognize ingredients, estimate portion sizes, and log everything in one click
          </p>
        </div>

        <button
          onClick={() => {
            setCapturedImage(null);
            setScanResult(null);
            setAnalysisError(null);
            startCamera();
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Camera className="w-4 h-4" />
          <span>Launch Camera View</span>
        </button>
      </div>

      {/* Camera Viewport & Capture Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Camera View / Image Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Iframe Notice for Google AI Studio Preview */}
          {isInIframe && (
            <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/30 text-xs text-slate-300 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate text-[11px] text-slate-300">
                  Inside AI Studio Preview. If camera is blocked on phone:
                </span>
              </div>
              <button
                type="button"
                onClick={openStandaloneTab}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Open Tab</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md relative min-h-[340px] flex flex-col justify-between">
            {/* Viewport Box (Fixed aspect-4/3) */}
            <div className="relative w-full aspect-4/3 bg-slate-950 flex items-center justify-center overflow-hidden">
              {/* Permanent Video Element - NEVER unmounted by React, guaranteeing stable ref and stream attachment */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />

              {/* Connecting State while camera stream initializes */}
              {isCameraActive && (!isVideoReady || isStartingCamera) && (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-300 gap-3 p-4 z-10">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                    <Camera className="w-5 h-5 text-emerald-400 absolute inset-0 m-auto" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-semibold text-white">Starting Camera Feed...</p>
                    <p className="text-[11px] text-slate-400">Requesting Android camera stream ({facingMode === 'environment' ? 'Rear' : 'Front'})</p>
                  </div>
                </div>
              )}

              {/* Live HUD overlay when ready */}
              {isCameraActive && isVideoReady && (
                <>
                  <div className="absolute inset-0 pointer-events-none border border-emerald-500/20 m-6 rounded-2xl flex flex-col justify-between p-3 z-10">
                    <div className="flex justify-between items-center text-[10px] text-emerald-400/90 font-mono">
                      <span className="bg-slate-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">[FRAME MEAL]</span>
                      <span className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE {facingMode === 'environment' ? 'REAR' : 'FRONT'}
                        {videoDimensions.width > 0 && ` (${videoDimensions.width}×${videoDimensions.height})`}
                      </span>
                    </div>
                    <div className="text-center text-[11px] text-emerald-200/90 bg-slate-950/80 py-1.5 px-4 rounded-full mx-auto backdrop-blur-xs border border-emerald-500/30 shadow-md">
                      Center food plate in frame
                    </div>
                  </div>

                  {/* Flip camera control */}
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="absolute top-3 right-3 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 active:scale-95 text-white backdrop-blur-md transition-all shadow-md z-20 cursor-pointer"
                    title="Switch Camera (Front/Rear)"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Captured or Uploaded Preview */}
              {!isCameraActive && capturedImage && (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <img
                    src={capturedImage}
                    alt="Captured Meal Preview"
                    className="w-full h-full object-cover"
                  />

                  {/* Scanner Laser Animation while analyzing */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 pointer-events-none bg-emerald-500/10 flex flex-col justify-between">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                      <div className="p-4 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 text-emerald-400 text-xs font-bold shadow-lg border border-emerald-500/30 backdrop-blur-md">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Analyzing food components with AI...</span>
                        </div>
                      </div>
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                    </div>
                  )}
                </div>
              )}

              {/* Empty Idle State */}
              {!isCameraActive && !capturedImage && (
                <div className="p-8 text-center text-slate-300 flex flex-col items-center justify-center flex-1 space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">
                      Ready to Scan Your Food
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Use your phone or webcam to take a photo of your plate, or upload a picture from your gallery.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Control Bar */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
              {isCameraActive ? (
                <>
                  <button
                    onClick={stopCamera}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={capturePhoto}
                    disabled={!isVideoReady}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span>{isVideoReady ? 'Take Picture' : 'Initializing Camera...'}</span>
                  </button>
                </>
              ) : capturedImage ? (
                <>
                  <button
                    onClick={() => startCamera()}
                    className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                  <button
                    onClick={analyzeMeal}
                    disabled={isAnalyzing}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Meal with AI'}</span>
                  </button>
                </>
              ) : (
                <div className="w-full flex items-center gap-2">
                  <button
                    onClick={() => startCamera()}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Camera</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Camera Error Alert */}
          {cameraError && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="flex-1">
                  <span className="font-semibold block">Camera Notice:</span>
                  <span>{cameraError}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
                <button
                  type="button"
                  onClick={openStandaloneTab}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Standalone Tab</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDiagnostics(!showDiagnostics)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  {showDiagnostics ? 'Hide Diagnostics' : 'Check Diagnostics'}
                </button>
              </div>
            </div>
          )}

          {/* Diagnostics Panel (Collapsible) */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="w-full p-3.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 font-medium">
                <Info className="w-4 h-4 text-emerald-500" />
                <span>Camera & Environment Diagnostics</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {showDiagnostics ? 'Collapse' : 'Expand'}
              </span>
            </button>

            {showDiagnostics && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-[11px] bg-slate-50/50 dark:bg-slate-950/40">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Secure Context (HTTPS)</span>
                    <span className={`font-bold ${diagInfo.isSecureContext ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      {diagInfo.isSecureContext ? 'Yes (Secure)' : 'No (Insecure)'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Environment</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {diagInfo.isInIframe ? 'AI Studio Preview (Iframe)' : 'Standalone Tab'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Camera Permission</span>
                    <span className={`font-bold ${diagInfo.permissionStatus === 'granted' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                      {diagInfo.permissionStatus}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Stream Status</span>
                    <span className={`font-bold ${isCameraActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {isCameraActive ? (isVideoReady ? 'Streaming Frames' : 'Connecting...') : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resolution:</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                      {videoDimensions.width > 0 ? `${videoDimensions.width} × ${videoDimensions.height}` : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Track Label:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
                      {diagInfo.trackLabel || 'None'}
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={openStandaloneTab}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Standalone Tab</span>
                  </button>
                  <button
                    type="button"
                    onClick={updateDiagnostics}
                    className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Sample Selector (Essential for instant testing in sandboxes) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Or Test with Real Meal Photos:
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">1-click AI scan</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample('/src/assets/images/rice_chicken_plate_1793991751623.jpg')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <img
                  src="/src/assets/images/rice_chicken_plate_1793991751623.jpg"
                  alt="Sample Rice & Chicken"
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-bold truncate text-[11px] group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Rice & Chicken</div>
                  <div className="text-[10px] text-slate-400 truncate">Rice, chicken & greens</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample('/src/assets/images/breakfast_eggs_toast_1793991768672.jpg')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <img
                  src="/src/assets/images/breakfast_eggs_toast_1793991768672.jpg"
                  alt="Sample Eggs & Toast"
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-bold truncate text-[11px] group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Eggs & Toast</div>
                  <div className="text-[10px] text-slate-400 truncate">Eggs, toast, avocado</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample('/src/assets/images/nutritrack_hero_bowl_1793989036042.jpg')}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <img
                  src="/src/assets/images/nutritrack_hero_bowl_1793989036042.jpg"
                  alt="Sample Grain Bowl"
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-bold truncate text-[11px] group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Grain Bowl</div>
                  <div className="text-[10px] text-slate-400 truncate">Quinoa & fresh bowl</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-center text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-0.5" />
                <span className="text-[10px] font-semibold">Upload Photo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis Results & Review Screen (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Analysis Error Message */}
          {analysisError && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1 space-y-1">
                <span className="font-bold block">Recognition Issue</span>
                <p className="leading-relaxed">{analysisError}</p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setAnalysisError(null);
                      analyzeMeal();
                    }}
                    className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors"
                  >
                    Retry Analysis
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {isAnalyzing && (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  NutriTrack AI is Examining Your Meal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Detecting individual ingredients, estimating portion weights, and matching USDA standard nutritional values...
                </p>
              </div>

              <div className="pt-4 max-w-sm mx-auto space-y-2">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4" />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Vision Analysis</span>
                  <span>Processing...</span>
                </div>
              </div>
            </div>
          )}

          {/* Recognized Results Card & Review */}
          {!isAnalyzing && scanResult && scanResult.isFood && (
            <div className="space-y-6">
              {/* Overview Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      Identified Plate
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                      {scanResult.mealOverview}
                    </h2>
                    {scanResult.nutritionalNotes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {scanResult.nutritionalNotes}
                      </p>
                    )}
                  </div>

                  {/* Total Calories Badge */}
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-right shrink-0">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Total Energy
                    </span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                      {totalCalories}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">kcal</span>
                  </div>
                </div>

                {/* Macro summary pills */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850">
                    <div className="text-[10px] font-sans text-slate-400">Protein</div>
                    <div className="font-bold text-teal-600 dark:text-teal-400">{totalProtein}g</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850">
                    <div className="text-[10px] font-sans text-slate-400">Carbs</div>
                    <div className="font-bold text-amber-500">{totalCarbs}g</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850">
                    <div className="text-[10px] font-sans text-slate-400">Fat</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">{totalFat}g</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850">
                    <div className="text-[10px] font-sans text-slate-400">Fiber</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{totalFiber}g</div>
                  </div>
                </div>
              </div>

              {/* Identified Ingredients Review & Edit Table */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Detected Food Components ({editableItems.length})
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Review, adjust portion sizes, or delete any misidentified ingredients
                    </p>
                  </div>

                  <button
                    onClick={handleAddNewItem}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {editableItems.map((item) => {
                    const isEditing = editingItemId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                                className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold"
                              />
                            ) : (
                              <div className="flex items-baseline gap-2">
                                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                  {item.name}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {item.category}
                                </span>
                              </div>
                            )}

                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              Portion: {item.servingSize} {item.servingUnit} ·{' '}
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {item.calories} kcal
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setEditingItemId(isEditing ? null : item.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                              title={isEditing ? 'Done' : 'Edit Portion & Macros'}
                            >
                              {isEditing ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit2 className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Inline editing controls if opened */}
                        {isEditing && (
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                            <div>
                              <label className="text-[10px] text-slate-400 font-medium block">
                                Portion
                              </label>
                              <input
                                type="number"
                                value={item.servingSize}
                                onChange={(e) => handleUpdateItem(item.id, 'servingSize', Number(e.target.value))}
                                className="w-full px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 font-medium block">
                                Calories (kcal)
                              </label>
                              <input
                                type="number"
                                value={item.calories}
                                onChange={(e) => handleUpdateItem(item.id, 'calories', Number(e.target.value))}
                                className="w-full px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 font-medium block">
                                Protein (g)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={item.protein}
                                onChange={(e) => handleUpdateItem(item.id, 'protein', Number(e.target.value))}
                                className="w-full px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 font-medium block">
                                Carbs (g)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={item.carbs}
                                onChange={(e) => handleUpdateItem(item.id, 'carbs', Number(e.target.value))}
                                className="w-full px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 font-medium block">
                                Fat (g)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={item.fat}
                                onChange={(e) => handleUpdateItem(item.id, 'fat', Number(e.target.value))}
                                className="w-full px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold font-mono"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Meal Category Confirmation */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Log this meal as:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealCategory[]).map((meal) => {
                      const isSelected = selectedMealType === meal;
                      return (
                        <button
                          key={meal}
                          type="button"
                          onClick={() => setSelectedMealType(meal)}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all border ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {meal}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Action: Add to Food Diary */}
                <div className="pt-2">
                  <button
                    onClick={handleAddToDiary}
                    className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                    <span>
                      Add {editableItems.length} Items to {selectedMealType.toUpperCase()} ({totalCalories} kcal)
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Idle instructions card when no scan has been executed yet */}
          {!isAnalyzing && !scanResult && (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    How AI Food Scanner Works
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    One-touch nutritional logging with computer vision
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-1.5 border border-slate-100 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center">
                    1
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white">Capture or Upload</div>
                  <p className="text-slate-500 dark:text-slate-400 leading-normal">
                    Take a picture of your plate or upload any meal picture from your camera roll.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-1.5 border border-slate-100 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center">
                    2
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white">AI Visual Analysis</div>
                  <p className="text-slate-500 dark:text-slate-400 leading-normal">
                    Gemini AI detects individual foods, portion sizes, calories, and macros.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-1.5 border border-slate-100 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center">
                    3
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white">1-Click Diary Sync</div>
                  <p className="text-slate-500 dark:text-slate-400 leading-normal">
                    Review and confirm portions to instantly update your daily dashboard and charts.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
