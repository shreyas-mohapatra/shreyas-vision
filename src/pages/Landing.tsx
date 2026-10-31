import React from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  ShieldCheck,
  Activity,
  Layers,
  ArrowRight,
  Sprout,
  CheckCircle2,
  Clock,
  Eye,
  Crosshair,
} from 'lucide-react';
import { HeroFieldScene } from '../components/three/HeroFieldScene.js';
import { TiltCard } from '../components/three/TiltCard.js';
import { Navbar } from '../components/layout/Navbar.js';
import { Footer } from '../components/layout/Footer.js';
import { DisclaimerBanner } from '../components/results/DisclaimerBanner.js';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <Navbar />

      {/* Hero Section with 3D Scene */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Hero Pitch */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-100 border border-soil-600/15 text-xs text-soil-800">
              <span className="w-2 h-2 rounded-full bg-leaf-500 animate-pulse" />
              <span className="font-medium font-serif">Computer Vision & Visual Intelligence</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-soil-950 tracking-tight leading-[1.15]">
              AI-Powered Crop Pathology & Field Advisory Assistant
            </h1>

            <p className="text-sm sm:text-base text-soil-700 leading-relaxed max-w-xl">
              Equipping smallholder farmers and agri-extension officers with instant, server-side visual diagnosis. Upload crop photos to localize visible disease lesions, receive structured organic treatment plans, and track field health progression over weeks.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-cream-50 font-semibold text-sm warm-shadow-md btn-press transition-all"
              >
                <Camera className="w-4 h-4 text-wheat-300" />
                <span>Start Visual Diagnosis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cream-100 hover:bg-cream-200 text-soil-800 font-medium text-sm border border-soil-600/20 warm-shadow-sm btn-press transition-all"
              >
                <span>Demo Account</span>
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs text-soil-600 border-t border-soil-600/10">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-leaf-600" />
                <span>&lt; 30s Diagnosis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-leaf-600" />
                <span>Normalized Bounding Boxes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-leaf-600" />
                <span>Cultural First, Safe Inputs</span>
              </div>
            </div>
          </div>

          {/* 3D Farmland Interactive Hero Scene */}
          <div className="lg:col-span-6 w-full">
            <HeroFieldScene />
          </div>
        </div>
      </section>

      {/* Verbatim Problem & Solution Section */}
      <section className="bg-cream-100 border-y border-soil-600/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-cream-50 border border-soil-600/15 warm-shadow-sm space-y-3">
            <span className="text-xs uppercase font-serif tracking-wider font-bold text-rust-600">
              The Agricultural Challenge
            </span>
            <h3 className="font-serif text-lg font-bold text-soil-900">Problem Statement</h3>
            <p className="text-xs sm:text-sm text-soil-700 leading-relaxed">
              Smallholder farmers and field officers rely on manual visual inspection of crops. This is slow, depends on scarce expert availability, produces inconsistent diagnoses between inspectors, and misses early-stage anomalies, which causes avoidable yield loss and over- or mis-use of pesticides.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-cream-50 border border-leaf-700/30 warm-shadow-sm space-y-3">
            <span className="text-xs uppercase font-serif tracking-wider font-bold text-leaf-700">
              The Vision Intelligence Answer
            </span>
            <h3 className="font-serif text-lg font-bold text-soil-900">Solution Description</h3>
            <p className="text-xs sm:text-sm text-soil-700 leading-relaxed">
              AgriLens is an AI-powered Computer Vision advisory platform. Users upload crop images; a vision-capable Gemini model analyzes them server-side, identifies the crop, detects diseases, pests, nutrient deficiencies and stress patterns, localizes affected regions on the image, scores severity, and returns a structured, prioritized advisory. Repeated scans of the same field are compared to detect progression and anomalies. A 3D interactive interface makes the results intuitive and engaging.
            </p>
          </div>
        </div>
      </section>

      {/* Core Architectural Capabilities */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-serif font-bold uppercase tracking-wider text-clay-400">
            End-To-End Agronomic Intelligence
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-soil-950">
            How AgriLens Inspects, Localizes, & Advises
          </h2>
          <p className="text-xs sm:text-sm text-soil-600">
            Built from first principles to ensure responsible input use and actionable field decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TiltCard className="p-6 bg-cream-100 border border-soil-600/15 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-leaf-700 text-wheat-300 flex items-center justify-center warm-shadow-sm">
              <Eye className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-base font-bold text-soil-900">
              1. Seeing & Visual Pathology
            </h4>
            <p className="text-xs text-soil-600 leading-relaxed">
              Google Gemini vision models analyze texture, discoloration, chlorosis, and pest punctures server-side. Images are normalized, resized, and stripped of sensitive GPS metadata with Sharp before analysis.
            </p>
          </TiltCard>

          <TiltCard className="p-6 bg-cream-100 border border-soil-600/15 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-clay-400 text-cream-50 flex items-center justify-center warm-shadow-sm">
              <Crosshair className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-base font-bold text-soil-900">
              2. Localizing with Bounding Boxes
            </h4>
            <p className="text-xs text-soil-600 leading-relaxed">
              Every detected pathology is bounded by normalized coordinates [x, y, w, h] in [0,1], rendered over uploaded photos with interactive overlays linked to clinical finding cards and our 3D leaf model.
            </p>
          </TiltCard>

          <TiltCard className="p-6 bg-cream-100 border border-soil-600/15 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-soil-800 text-cream-50 flex items-center justify-center warm-shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-base font-bold text-soil-900">
              3. Visual Progression Tracking
            </h4>
            <p className="text-xs text-soil-600 leading-relaxed">
              Re-scan the same plot weeks later. The multi-modal comparison engine contrasts before/after photos and reports status as improved, stable, worsening, or detects new anomalies with split-slider visualization.
            </p>
          </TiltCard>
        </div>

        {/* Advisory Disclaimer Notice */}
        <div className="max-w-3xl mx-auto pt-4">
          <DisclaimerBanner />
        </div>
      </section>

      <Footer />
    </div>
  );
};
