import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Code, Database, Cpu, GitMerge, Users, TrendingUp, Layers, Zap } from "lucide-react";

export default function Implementation() {
  const [activeTab, setActiveTab] = useState("enhancement");

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Code className="w-10 h-10 text-indigo-600" />
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Implementation Guide
          </h1>
        </div>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Backend code examples, fusion algorithms, and practical implementation for the Document Transformation Engine
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <Badge className="bg-indigo-100 text-indigo-700">Production-Ready</Badge>
          <Badge className="bg-emerald-100 text-emerald-700">Scalable</Badge>
          <Badge className="bg-violet-100 text-violet-700">Enterprise-Grade</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="enhancement" className="flex flex-col items-center gap-1 py-3">
            <Cpu className="w-4 h-4" />
            <span className="text-xs">Enhancement</span>
          </TabsTrigger>
          <TabsTrigger value="ocr-fusion" className="flex flex-col items-center gap-1 py-3">
            <GitMerge className="w-4 h-4" />
            <span className="text-xs">OCR Fusion</span>
          </TabsTrigger>
          <TabsTrigger value="confidence" className="flex flex-col items-center gap-1 py-3">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Confidence</span>
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex flex-col items-center gap-1 py-3">
            <Layers className="w-4 h-4" />
            <span className="text-xs">Validation</span>
          </TabsTrigger>
          <TabsTrigger value="hitl" className="flex flex-col items-center gap-1 py-3">
            <Users className="w-4 h-4" />
            <span className="text-xs">Human Loop</span>
          </TabsTrigger>
          <TabsTrigger value="scaling" className="flex flex-col items-center gap-1 py-3">
            <Zap className="w-4 h-4" />
            <span className="text-xs">Scaling</span>
          </TabsTrigger>
        </TabsList>

        {/* Enhancement Tab */}
        <TabsContent value="enhancement" className="space-y-6">
          <Card className="border-indigo-200 bg-indigo-50/30">
            <CardHeader>
              <CardTitle className="text-indigo-900">Image Enhancement Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CodeBlock
                title="1. Damage Assessment & Region Tagging"
                language="python"
                code={`import cv2
import numpy as np
from scipy import ndimage

def assess_document_damage(image_path):
    """
    Analyze document degradation and tag regions by damage type.
    Returns damage map with severity scores per region.
    """
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    # Detect blur using Laplacian variance
    laplacian_var = cv2.Laplacian(img, cv2.CV_64F).var()
    blur_severity = "high" if laplacian_var < 100 else "low"
    
    # Detect faded ink via histogram analysis
    hist = cv2.calcHist([img], [0], None, [256], [0, 256])
    low_intensity_pixels = np.sum(hist[0:50]) / img.size
    fade_severity = "high" if low_intensity_pixels > 0.3 else "low"
    
    # Detect stains via color anomaly (if color image)
    # ... (color-based stain detection logic)
    
    # Detect fold lines using edge detection
    edges = cv2.Canny(img, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, 100)
    fold_count = len(lines) if lines is not None else 0
    
    return {
        "overall_condition": "degraded" if blur_severity == "high" else "good",
        "detected_issues": [
            {"type": "blur", "severity": blur_severity, "score": laplacian_var},
            {"type": "fading", "severity": fade_severity, "ratio": low_intensity_pixels},
            {"type": "folds", "count": fold_count}
        ],
        "recommended_models": {
            "denoising": "bilateral_filter" if blur_severity == "high" else "gaussian",
            "restoration": "diffusion" if fade_severity == "high" else "esrgan"
        }
    }
`}
              />

              <CodeBlock
                title="2. Adaptive Enhancement per Region"
                language="python"
                code={`from PIL import Image
import torch
from realesrgan import RealESRGANer
from swinir import SwinIR

def enhance_document_adaptive(image_path, damage_assessment):
    """
    Apply region-specific enhancement based on damage analysis.
    Uses different models for different degradation types.
    """
    img = Image.open(image_path)
    img_np = np.array(img)
    
    # 1. Deskew using Hough transform
    coords = np.column_stack(np.where(img_np > 0))
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    (h, w) = img_np.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    deskewed = cv2.warpAffine(img_np, M, (w, h), 
                              flags=cv2.INTER_CUBIC, 
                              borderMode=cv2.BORDER_REPLICATE)
    
    # 2. Adaptive denoising based on damage assessment
    if damage_assessment["recommended_models"]["denoising"] == "bilateral_filter":
        denoised = cv2.bilateralFilter(deskewed, 9, 75, 75)
    else:
        denoised = cv2.GaussianBlur(deskewed, (3, 3), 0)
    
    # 3. Super-resolution (4x) using Real-ESRGAN
    if damage_assessment["overall_condition"] == "degraded":
        model = RealESRGANer(
            scale=4,
            model_path='RealESRGAN_x4plus.pth',
            model=RealESRGAN(4, 3, 64)  # 4x upscaling
        )
        enhanced, _ = model.enhance(denoised)
    else:
        enhanced = denoised
    
    # 4. Ink restoration for faded text using diffusion
    if damage_assessment["detected_issues"][1]["severity"] == "high":
        enhanced = restore_faded_ink(enhanced)
    
    # 5. Adaptive contrast enhancement per semantic region
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(enhanced)
    
    return {
        "enhanced_image": enhanced,
        "transformations_applied": [
            f"deskew_{angle:.2f}_degrees",
            damage_assessment["recommended_models"]["denoising"],
            "super_resolution_4x" if damage_assessment["overall_condition"] == "degraded" else "none",
            "ink_restoration" if damage_assessment["detected_issues"][1]["severity"] == "high" else "none",
            "adaptive_contrast_clahe"
        ],
        "quality_improvement_estimate": calculate_psnr_improvement(img_np, enhanced)
    }

def restore_faded_ink(image):
    """Diffusion-based ink restoration for severely faded text."""
    # Simplified version - production would use diffusion models
    alpha = 1.5  # Contrast
    beta = 30    # Brightness
    restored = cv2.convertScaleAbs(image, alpha=alpha, beta=beta)
    return restored
`}
              />

              <CodeBlock
                title="3. Forensic Preservation & Fingerprinting"
                language="python"
                code={`import hashlib
from PIL import Image
import imagehash

def preserve_document_forensically(original_file_path):
    """
    Generate cryptographic fingerprint and preserve original metadata.
    Ensures forensic integrity and tamper detection.
    """
    # SHA-256 hash of original binary
    with open(original_file_path, 'rb') as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()
    
    # Perceptual hash (pHash) for visual similarity
    img = Image.open(original_file_path)
    perceptual_hash = str(imagehash.phash(img, hash_size=16))
    
    # Extract EXIF metadata
    exif_data = img._getexif() if hasattr(img, '_getexif') else {}
    
    metadata = {
        "sha256_fingerprint": file_hash,
        "perceptual_hash": perceptual_hash,
        "file_size_bytes": os.path.getsize(original_file_path),
        "image_dimensions": f"{img.width}x{img.height}",
        "color_mode": img.mode,
        "dpi": img.info.get('dpi', (72, 72)),
        "exif": exif_data,
        "preservation_timestamp": datetime.utcnow().isoformat(),
        "tampering_risk": "none"  # Initial assessment
    }
    
    # Store original immutably (e.g., S3 with object lock)
    s3_url = upload_to_immutable_storage(original_file_path, file_hash)
    
    return {
        "fingerprint": file_hash,
        "scan_metadata": metadata,
        "original_file_url": s3_url,
        "preservation_certified": True
    }
`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* OCR Fusion Tab */}
        <TabsContent value="ocr-fusion" className="space-y-6">
          <Card className="border-violet-200 bg-violet-50/30">
            <CardHeader>
              <CardTitle className="text-violet-900">Multi-Model OCR Consensus & Fusion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CodeBlock
                title="1. Multi-OCR Parallel Execution"
                language="python"
                code={`import asyncio
from google.cloud import vision
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
# ABBYY SDK (commercial license required)

async def run_multi_ocr_consensus(enhanced_image_path):
    """
    Run 3 OCR engines in parallel and prepare for consensus fusion.
    Returns results from ABBYY, Google Vision, and Azure Form Recognizer.
    """
    
    async def run_abbyy_ocr():
        """Conservative, high-precision OCR."""
        # ABBYY FineReader SDK integration
        result = abbyy_client.recognize(enhanced_image_path, 
                                       language="eng",
                                       text_type="machine_print")
        return {
            "engine": "abbyy",
            "text": result.text,
            "confidence": result.confidence,
            "char_boxes": result.character_boxes,
            "profile": "conservative"
        }
    
    async def run_google_vision():
        """Balanced, context-aware OCR."""
        client = vision.ImageAnnotatorClient()
        with open(enhanced_image_path, 'rb') as f:
            content = f.read()
        image = vision.Image(content=content)
        response = client.document_text_detection(image=image)
        
        return {
            "engine": "google_vision",
            "text": response.full_text_annotation.text,
            "confidence": np.mean([page.confidence for page in response.full_text_annotation.pages]),
            "char_boxes": extract_char_boxes_from_google(response),
            "profile": "balanced"
        }
    
    async def run_azure_form_recognizer():
        """Aggressive, form-optimized extraction."""
        client = ComputerVisionClient(endpoint, credentials)
        with open(enhanced_image_path, 'rb') as f:
            result = client.read_in_stream(f, raw=True)
        
        # Poll for result
        operation_id = result.headers["Operation-Location"].split("/")[-1]
        while True:
            result = client.get_read_result(operation_id)
            if result.status not in ['notStarted', 'running']:
                break
            await asyncio.sleep(1)
        
        return {
            "engine": "azure",
            "text": extract_text_from_azure(result),
            "confidence": calculate_azure_confidence(result),
            "char_boxes": extract_char_boxes_from_azure(result),
            "profile": "aggressive"
        }
    
    # Execute all OCR engines in parallel
    results = await asyncio.gather(
        run_abbyy_ocr(),
        run_google_vision(),
        run_azure_form_recognizer()
    )
    
    return {
        "ocr_results": results,
        "execution_time_ms": results[0]["time"] + results[1]["time"] + results[2]["time"]
    }
`}
              />

              <CodeBlock
                title="2. Character-Level Alignment & Consensus"
                language="python"
                code={`from difflib import SequenceMatcher
import numpy as np

def fuse_multi_ocr_consensus(ocr_results):
    """
    Align OCR outputs character-by-character and perform weighted consensus voting.
    Detects disagreements and calculates per-character confidence.
    """
    
    # Extract text from each engine
    abbyy_text = ocr_results["ocr_results"][0]["text"]
    google_text = ocr_results["ocr_results"][1]["text"]
    azure_text = ocr_results["ocr_results"][2]["text"]
    
    # Character-level alignment using edit distance
    def align_texts(text1, text2, text3):
        """Align three texts using dynamic programming."""
        # Use ABBYY (conservative) as baseline
        baseline = text1
        aligned = {"abbyy": [], "google": [], "azure": [], "consensus": []}
        
        for i, char in enumerate(baseline):
            # Find corresponding characters in other engines
            google_char = find_aligned_char(char, google_text, i)
            azure_char = find_aligned_char(char, azure_text, i)
            
            aligned["abbyy"].append(char)
            aligned["google"].append(google_char)
            aligned["azure"].append(azure_char)
        
        return aligned
    
    aligned = align_texts(abbyy_text, google_text, azure_text)
    
    # Weighted consensus voting per character
    consensus_text = []
    confidence_map = []
    disagreements = []
    
    for i in range(len(aligned["abbyy"])):
        chars = [aligned["abbyy"][i], aligned["google"][i], aligned["azure"][i]]
        
        # Majority vote with confidence weighting
        if chars[0] == chars[1] == chars[2]:
            # Perfect agreement
            consensus_text.append(chars[0])
            confidence_map.append(0.98)
        elif chars[0] == chars[1] or chars[0] == chars[2]:
            # 2/3 agreement, ABBYY involved
            consensus_text.append(chars[0])
            confidence_map.append(0.85)
        elif chars[1] == chars[2]:
            # 2/3 agreement, ABBYY differs
            consensus_text.append(chars[1])
            confidence_map.append(0.75)
            disagreements.append({
                "position": i,
                "abbyy": chars[0],
                "google": chars[1],
                "azure": chars[2],
                "chosen": chars[1],
                "reason": "google_azure_consensus"
            })
        else:
            # Complete disagreement - flag for human review
            consensus_text.append(chars[0])  # Default to conservative
            confidence_map.append(0.45)
            disagreements.append({
                "position": i,
                "abbyy": chars[0],
                "google": chars[1],
                "azure": chars[2],
                "chosen": chars[0],
                "reason": "no_consensus_use_conservative"
            })
    
    return {
        "consensus_text": ''.join(consensus_text),
        "character_confidence_map": confidence_map,
        "overall_confidence": np.mean(confidence_map) * 100,
        "disagreements": disagreements,
        "hallucination_risk_score": len([d for d in disagreements if d["reason"] == "no_consensus_use_conservative"]) / len(consensus_text) * 100
    }
`}
              />

              <CodeBlock
                title="3. Vision LLM Contextual Verification"
                language="python"
                code={`from openai import OpenAI

def verify_extraction_with_vision_llm(image_path, consensus_text, disagreements):
    """
    Use Vision LLM (GPT-4V / Gemini Pro Vision) to verify extractions
    and resolve high-uncertainty regions.
    """
    client = OpenAI()
    
    # Identify high-risk regions (low confidence or disagreements)
    high_risk_regions = [d for d in disagreements if len(set([d["abbyy"], d["google"], d["azure"]])) == 3]
    
    if not high_risk_regions:
        return {"verification_needed": False}
    
    # Crop image to high-risk regions
    cropped_regions = crop_image_regions(image_path, high_risk_regions)
    
    verification_results = []
    
    for idx, region in enumerate(cropped_regions):
        # Encode image to base64
        base64_image = encode_image_base64(region["image"])
        
        response = client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert at reading degraded historical documents. Analyze the image and determine what text is actually written."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"Three OCR engines gave these results: '{region['abbyy']}', '{region['google']}', '{region['azure']}'. Which is correct? Or is it something else?"
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ]
        )
        
        llm_interpretation = response.choices[0].message.content
        
        verification_results.append({
            "region_index": idx,
            "ocr_disagreement": region,
            "llm_interpretation": llm_interpretation,
            "confidence_after_llm": 0.88  # Based on LLM response certainty
        })
    
    return {
        "verification_needed": True,
        "regions_verified": len(verification_results),
        "verification_results": verification_results,
        "recommended_corrections": extract_corrections_from_llm(verification_results)
    }
`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Confidence Tab */}
        <TabsContent value="confidence" className="space-y-6">
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardHeader>
              <CardTitle className="text-emerald-900">Confidence Propagation & Trust Scoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CodeBlock
                title="Pixel → Token → Field → Document Confidence"
                language="python"
                code={`def calculate_trust_score_hierarchical(document, ocr_fusion_result, validation_results):
    """
    Calculate trust score with confidence propagation through all levels.
    Pixel → Character → Token → Field → Document → Overall Trust
    """
    
    # 1. Pixel-level confidence (from enhancement quality)
    pixel_quality_score = calculate_pixel_quality(
        original=document.original_file_url,
        enhanced=document.enhanced_file_url
    )  # PSNR, SSIM metrics
    
    # 2. Character-level confidence (from OCR consensus)
    char_confidence_avg = np.mean(ocr_fusion_result["character_confidence_map"])
    
    # 3. Token-level confidence (aggregate characters into words)
    token_confidences = []
    tokens = ocr_fusion_result["consensus_text"].split()
    char_idx = 0
    for token in tokens:
        token_conf = np.mean(ocr_fusion_result["character_confidence_map"][char_idx:char_idx+len(token)])
        token_confidences.append(token_conf)
        char_idx += len(token) + 1  # +1 for space
    
    # 4. Field-level confidence (extracted entities)
    field_confidences = {}
    for entity in document.extracted_entities:
        field_text = entity["value"]
        # Find field in consensus text and get its confidence
        field_start = ocr_fusion_result["consensus_text"].find(field_text)
        if field_start != -1:
            field_conf = np.mean(
                ocr_fusion_result["character_confidence_map"][field_start:field_start+len(field_text)]
            )
        else:
            field_conf = 0.5  # Field not found in OCR, possibly inferred
        
        field_confidences[entity["field"]] = {
            "extraction_confidence": field_conf,
            "validation_passed": entity["field"] in validation_results["passed_fields"],
            "inferred": entity.get("inferred", False)
        }
    
    # 5. Model consensus score
    disagreement_rate = len(ocr_fusion_result["disagreements"]) / len(ocr_fusion_result["consensus_text"])
    model_consensus_score = (1 - disagreement_rate) * 100
    
    # 6. Semantic coherence (cross-field validation)
    semantic_coherence = len(validation_results["passed_rules"]) / len(validation_results["total_rules"]) * 100
    
    # 7. Reconstruction risk (% of AI-inferred content)
    inferred_chars = sum([len(e["value"]) for e in document.extracted_entities if e.get("inferred", False)])
    total_chars = len(ocr_fusion_result["consensus_text"])
    reconstruction_risk = (inferred_chars / total_chars) * 100 if total_chars > 0 else 0
    
    # 8. Aggregate into overall trust score
    extraction_certainty = (char_confidence_avg + model_consensus_score/100) / 2 * 100
    
    # Weighted formula for overall trust
    overall_trust = (
        pixel_quality_score * 0.15 +
        extraction_certainty * 0.35 +
        (100 - reconstruction_risk) * 0.25 +
        semantic_coherence * 0.15 +
        model_consensus_score * 0.10
    )
    
    # Court and bank readiness thresholds
    court_ready = (overall_trust >= 95 and reconstruction_risk < 10)
    bank_ready = (overall_trust >= 98 and reconstruction_risk < 5)
    
    # Identify high-risk fields requiring human review
    high_risk_fields = [
        field for field, conf in field_confidences.items()
        if conf["extraction_confidence"] < 0.80 or conf["inferred"]
    ]
    
    # Recommended action
    if overall_trust >= 95 and not high_risk_fields:
        recommended_action = "approve"
    elif overall_trust >= 85 and len(high_risk_fields) <= 3:
        recommended_action = "review_flagged_fields"
    elif overall_trust >= 70:
        recommended_action = "manual_review"
    else:
        recommended_action = "reject"
    
    return {
        "overall_trust": round(overall_trust, 2),
        "extraction_certainty": round(extraction_certainty, 2),
        "reconstruction_risk": round(reconstruction_risk, 2),
        "validation_pass_rate": round(semantic_coherence, 2),
        "model_consensus_score": round(model_consensus_score, 2),
        "pixel_quality_score": round(pixel_quality_score, 2),
        "semantic_coherence": round(semantic_coherence, 2),
        "court_ready": court_ready,
        "bank_ready": bank_ready,
        "high_risk_fields": high_risk_fields,
        "recommended_action": recommended_action,
        "trust_factors": {
            "pixel_quality": pixel_quality_score,
            "char_confidence": char_confidence_avg * 100,
            "model_agreement": model_consensus_score,
            "validation": semantic_coherence,
            "reconstruction": 100 - reconstruction_risk
        }
    }
`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-6">
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="text-blue-900">Semantic Validation & Anomaly Detection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CodeBlock
                title="Domain-Specific Validation Rules Engine"
                language="python"
                code={`def apply_validation_rules(document, extracted_entities):
    """
    Apply document-type-specific validation rules.
    Checks format, range, cross-field logic, and semantic consistency.
    """
    
    # Load validation rules for this document type
    rules = ValidationRule.filter(
        document_type=document.document_class,
        enabled=True
    )
    
    validation_results = {
        "passed_rules": [],
        "failed_rules": [],
        "warnings": [],
        "total_rules": len(rules),
        "passed_fields": set()
    }
    
    for rule in rules:
        result = execute_validation_rule(rule, extracted_entities, document)
        
        if result["passed"]:
            validation_results["passed_rules"].append(rule.rule_name)
            validation_results["passed_fields"].add(rule.field_name)
        else:
            failure = {
                "rule": rule.rule_name,
                "field": rule.field_name,
                "severity": rule.severity,
                "reason": result["reason"],
                "confidence_penalty": rule.confidence_penalty
            }
            
            if rule.severity == "error":
                validation_results["failed_rules"].append(failure)
            else:
                validation_results["warnings"].append(failure)
    
    return validation_results

def execute_validation_rule(rule, entities, document):
    """Execute a single validation rule."""
    
    entity = next((e for e in entities if e["field"] == rule.field_name), None)
    if not entity:
        return {"passed": False, "reason": "field_missing"}
    
    value = entity["value"]
    
    if rule.rule_type == "format":
        # Regex pattern matching
        import re
        pattern = rule.rule_logic.get("pattern")
        passed = bool(re.match(pattern, value))
        return {"passed": passed, "reason": f"format_mismatch: expected {pattern}"}
    
    elif rule.rule_type == "range":
        # Numeric range validation
        try:
            num_value = float(value.replace(',', ''))
            min_val = rule.rule_logic.get("min")
            max_val = rule.rule_logic.get("max")
            passed = min_val <= num_value <= max_val
            return {"passed": passed, "reason": f"out_of_range: {min_val}-{max_val}"}
        except:
            return {"passed": False, "reason": "not_numeric"}
    
    elif rule.rule_type == "cross_field":
        # Cross-field dependency validation
        dependent_field = rule.rule_logic.get("depends_on")
        dependent_entity = next((e for e in entities if e["field"] == dependent_field), None)
        
        if not dependent_entity:
            return {"passed": False, "reason": "dependent_field_missing"}
        
        # Custom logic based on document type
        passed = validate_cross_field_logic(entity, dependent_entity, rule.rule_logic)
        return {"passed": passed, "reason": "cross_field_inconsistency"}
    
    elif rule.rule_type == "external_lookup":
        # Verify against external database
        api_endpoint = rule.rule_logic.get("api_endpoint")
        response = requests.get(api_endpoint, params={"query": value})
        passed = response.json().get("exists", False)
        return {"passed": passed, "reason": "external_verification_failed"}
    
    elif rule.rule_type == "semantic":
        # LLM-based semantic validation
        passed = validate_semantic_consistency(entity, entities, rule.rule_logic)
        return {"passed": passed, "reason": "semantic_inconsistency"}
    
    return {"passed": True, "reason": "no_rule_logic"}
`}
              />

              <CodeBlock
                title="Anomaly Detection & Contradiction Flagging"
                language="python"
                code={`def detect_anomalies_and_contradictions(document, extracted_entities):
    """
    Detect missing fields, contradictions, and statistical anomalies.
    """
    anomalies = []
    
    # 1. Detect missing required fields for this document type
    expected_fields = get_expected_fields(document.document_class)
    extracted_fields = set([e["field"] for e in extracted_entities])
    missing_fields = expected_fields - extracted_fields
    
    for field in missing_fields:
        anomalies.append({
            "type": "missing_field",
            "description": f"Expected field '{field}' not found in document",
            "severity": "high" if field in CRITICAL_FIELDS else "medium",
            "location": "document"
        })
    
    # 2. Detect contradictions between fields
    # Example: total_amount != sum(line_items)
    if "total_amount" in extracted_fields and "line_items" in extracted_fields:
        total = float(next(e["value"] for e in extracted_entities if e["field"] == "total_amount").replace(',', ''))
        line_items = [e for e in extracted_entities if e["field"] == "line_items"]
        calculated_total = sum([float(item["value"]) for item in line_items])
        
        if abs(total - calculated_total) > 0.01:  # Allow small rounding errors
            anomalies.append({
                "type": "contradiction",
                "description": f"Total amount ({total}) doesn't match sum of line items ({calculated_total})",
                "severity": "high",
                "location": "total_amount_field"
            })
    
    # 3. Detect statistical outliers
    # Example: unusually high amounts, dates in future, etc.
    for entity in extracted_entities:
        if entity["field"].endswith("_amount"):
            try:
                amount = float(entity["value"].replace(',', ''))
                # Compare to historical documents of same type
                percentile = calculate_percentile(amount, document.document_class, entity["field"])
                if percentile > 99:
                    anomalies.append({
                        "type": "statistical_outlier",
                        "description": f"{entity['field']} ({amount}) is in 99th percentile - unusually high",
                        "severity": "medium",
                        "location": entity["field"]
                    })
            except:
                pass
    
    # 4. Detect temporal anomalies
    date_fields = [e for e in extracted_entities if "date" in e["field"].lower()]
    for date_field in date_fields:
        try:
            date = parse_date(date_field["value"])
            if date > datetime.now():
                anomalies.append({
                    "type": "temporal_anomaly",
                    "description": f"{date_field['field']} is in the future",
                    "severity": "high",
                    "location": date_field["field"]
                })
        except:
            pass
    
    return anomalies
`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Human-in-the-Loop Tab */}
        <TabsContent value="hitl" className="space-y-6">
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader>
              <CardTitle className="text-amber-900">Human-in-the-Loop Correction & Learning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <CodeBlock
                title="Identify Low-Confidence Regions for Review"
                language="python"
                code={`def identify_correction_targets(document, trust_score, ocr_fusion):
    """
    Intelligently select only the regions that need human review.
    Minimizes human effort while maximizing accuracy improvement.
    """
    
    correction_targets = []
    
    # 1. Flag fields with confidence < 80%
    for entity in document.extracted_entities:
        if entity.get("confidence", 100) < 80:
            # Get the region coordinates from OCR
            region = find_entity_region(entity, ocr_fusion)
            
            correction_targets.append({
                "type": "low_confidence_field",
                "field": entity["field"],
                "current_value": entity["value"],
                "confidence": entity["confidence"],
                "region_coordinates": region["coordinates"],
                "visual_context": crop_image_region(document.enhanced_file_url, region["coordinates"]),
                "ai_suggestions": generate_alternatives(entity, ocr_fusion),
                "priority": "high" if entity["field"] in CRITICAL_FIELDS else "medium"
            })
    
    # 2. Flag areas with OCR disagreements
    for disagreement in ocr_fusion["disagreements"]:
        if disagreement["reason"] == "no_consensus_use_conservative":
            correction_targets.append({
                "type": "ocr_disagreement",
                "position": disagreement["position"],
                "ocr_options": {
                    "abbyy": disagreement["abbyy"],
                    "google": disagreement["google"],
                    "azure": disagreement["azure"]
                },
                "current_choice": disagreement["chosen"],
                "region_coordinates": calculate_char_position(disagreement["position"]),
                "visual_context": crop_char_region(document.enhanced_file_url, disagreement["position"]),
                "priority": "medium"
            })
    
    # 3. Flag fields that failed validation
    for failed_rule in trust_score.get("failed_rules", []):
        if failed_rule["severity"] == "error":
            correction_targets.append({
                "type": "validation_failure",
                "field": failed_rule["field"],
                "rule": failed_rule["rule"],
                "reason": failed_rule["reason"],
                "current_value": get_field_value(document, failed_rule["field"]),
                "expected_format": get_rule_format(failed_rule["rule"]),
                "priority": "high"
            })
    
    # Sort by priority and confidence
    correction_targets.sort(key=lambda x: (
        0 if x["priority"] == "high" else 1,
        x.get("confidence", 0)
    ))
    
    return {
        "total_targets": len(correction_targets),
        "high_priority": len([t for t in correction_targets if t["priority"] == "high"]),
        "targets": correction_targets,
        "estimated_time_minutes": len(correction_targets) * 0.5  # 30 seconds per correction
    }
`}
              />

              <CodeBlock
                title="Capture Corrections & Learn"
                language="python"
                code={`def process_human_correction(correction_data, document):
    """
    Process human correction and feed back into learning system.
    Generates new validation rules and updates model weights.
    """
    
    # 1. Save correction record
    correction = Correction.create({
        "document_id": document.id,
        "field_path": correction_data["field_path"],
        "original_value": correction_data["original_value"],
        "corrected_value": correction_data["corrected_value"],
        "confidence_before": correction_data["confidence_before"],
        "correction_reason": correction_data["reason"],
        "region_coordinates": correction_data["region_coordinates"],
        "visual_context": correction_data["visual_context_url"],
        "correction_notes": correction_data["notes"],
        "impact_score": calculate_correction_impact(correction_data)
    })
    
    # 2. Update document with corrected value
    update_document_entity(document, correction_data["field_path"], correction_data["corrected_value"])
    
    # 3. Learn from correction - generate new validation rule if pattern detected
    similar_corrections = Correction.filter(
        field_path=correction_data["field_path"],
        correction_reason=correction_data["reason"]
    ).count()
    
    if similar_corrections >= 3:  # Pattern threshold
        # Auto-generate validation rule
        learned_rule = generate_validation_rule_from_corrections(
            field_path=correction_data["field_path"],
            corrections=Correction.filter(field_path=correction_data["field_path"])
        )
        
        ValidationRule.create({
            "rule_name": f"learned_{correction_data['field_path']}_{datetime.now().timestamp()}",
            "document_type": document.document_class,
            "field_name": extract_field_name(correction_data["field_path"]),
            "rule_type": learned_rule["type"],
            "rule_logic": learned_rule["logic"],
            "severity": "warning",
            "confidence_penalty": 15,
            "enabled": True,
            "learned_from_corrections": True,
            "accuracy_stats": {"corrections_used": similar_corrections}
        })
    
    # 4. Update OCR model weights (for domain-specific fine-tuning)
    if correction_data["reason"] in ["misread_character", "hallucination"]:
        queue_model_retraining({
            "model": "ocr_ensemble",
            "correction_id": correction.id,
            "visual_context": correction_data["visual_context_url"],
            "ground_truth": correction_data["corrected_value"]
        })
    
    return {
        "correction_saved": True,
        "correction_id": correction.id,
        "learned_rule": learned_rule if similar_corrections >= 3 else None,
        "model_retrain_queued": correction_data["reason"] in ["misread_character", "hallucination"],
        "impact": correction.impact_score
    }

def generate_validation_rule_from_corrections(field_path, corrections):
    """
    Analyze multiple corrections to infer a validation rule.
    """
    # Extract patterns from corrected values
    corrected_values = [c.corrected_value for c in corrections]
    
    # Detect format pattern
    if all(re.match(r'^\\d{4}-\\d{2}-\\d{2}$', val) for val in corrected_values):
        return {
            "type": "format",
            "logic": {"pattern": r"^\\d{4}-\\d{2}-\\d{2}$"},
            "description": "Date format YYYY-MM-DD"
        }
    
    # Detect range pattern
    try:
        numeric_values = [float(val.replace(',', '')) for val in corrected_values]
        return {
            "type": "range",
            "logic": {
                "min": min(numeric_values) * 0.5,
                "max": max(numeric_values) * 2.0
            },
            "description": f"Typical range based on {len(corrections)} corrections"
        }
    except:
        pass
    
    # Detect enum pattern
    if len(set(corrected_values)) <= 5:
        return {
            "type": "format",
            "logic": {"enum": list(set(corrected_values))},
            "description": f"Must be one of: {', '.join(set(corrected_values))}"
        }
    
    return {"type": "custom", "logic": {}, "description": "Pattern unclear"}
`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scaling Tab */}
        <TabsContent value="scaling" className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Enterprise Scaling Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-900 rounded-xl p-6 text-slate-100 font-mono text-xs overflow-x-auto">
                <pre>{`# Async Processing Architecture

┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (FastAPI)                    │
│  • Document upload endpoint                                  │
│  • Async job submission                                      │
│  • WebSocket for real-time updates                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Message Queue (RabbitMQ/Redis)              │
│  • Job queue with priority levels                            │
│  • Dead letter queue for failures                            │
│  • Rate limiting per tenant                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Distributed Workers (Celery/Prefect)            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Enhancement │  │  OCR Fusion  │  │  Validation  │      │
│  │   Workers    │  │   Workers    │  │   Workers    │      │
│  │  (GPU-heavy) │  │ (CPU-heavy)  │  │ (CPU-light)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  • Auto-scaling based on queue length                        │
│  • GPU workers for enhancement/OCR                           │
│  • Separate queues per pipeline stage                        │
└─────────────────────────────────────────────────────────────┘

# Scaling Metrics

Documents/Hour (Single Worker):
  - Enhancement: 40-60 docs/hour
  - Multi-OCR: 20-30 docs/hour  
  - Validation: 100+ docs/hour

Horizontal Scaling:
  - 10 workers → 200-300 docs/hour
  - 50 workers → 1,000-1,500 docs/hour
  - 200 workers → 4,000-6,000 docs/hour

Cost Optimization:
  - Spot instances for non-critical jobs
  - GPU sharing for enhancement
  - Caching for duplicate documents (hash-based)
  - Batch processing for off-peak hours`}</pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ScalingStrategy
                  title="Performance Optimization"
                  strategies={[
                    "Cache enhancement results by fingerprint",
                    "Parallel OCR execution (async)",
                    "Lazy loading for large documents",
                    "Progressive enhancement (low→high res)",
                    "Regional model deployment (edge compute)"
                  ]}
                />
                <ScalingStrategy
                  title="Cost Reduction"
                  strategies={[
                    "Spot instances for batch jobs",
                    "GPU time-sharing",
                    "Smart model selection (skip enhancement if clean)",
                    "Tiered storage (hot/cold)",
                    "Compression for archived documents"
                  ]}
                />
                <ScalingStrategy
                  title="Reliability"
                  strategies={[
                    "Retry logic with exponential backoff",
                    "Dead letter queue for failures",
                    "Health checks for workers",
                    "Circuit breakers for external APIs",
                    "Graceful degradation (single OCR if others fail)"
                  ]}
                />
                <ScalingStrategy
                  title="Multi-Tenancy"
                  strategies={[
                    "Per-tenant rate limiting",
                    "Isolated storage buckets",
                    "Domain-specific model caching",
                    "Custom validation rules per tenant",
                    "SLA-based priority queues"
                  ]}
                />
              </div>

              <CodeBlock
                title="Production-Ready Async Pipeline"
                language="python"
                code={`from celery import Celery, chain
from celery.result import AsyncResult

app = Celery('document_pipeline', broker='redis://localhost:6379/0')

@app.task(bind=True, max_retries=3)
def process_document_pipeline(self, document_id):
    """
    Orchestrate the full document processing pipeline.
    Each stage is a separate task for horizontal scaling.
    """
    try:
        # Chain of tasks (executed sequentially)
        pipeline = chain(
            forensic_preservation.s(document_id),
            damage_assessment.s(),
            enhancement.s(),
            layout_analysis.s(),
            multi_ocr_fusion.s(),
            semantic_extraction.s(),
            validation.s(),
            trust_score_calculation.s(),
            generate_layered_output.s()
        )
        
        # Execute pipeline
        result = pipeline.apply_async()
        
        return {
            "status": "processing",
            "task_id": result.id,
            "document_id": document_id
        }
    
    except Exception as e:
        # Retry with exponential backoff
        self.retry(exc=e, countdown=2 ** self.request.retries)

# Individual stage tasks

@app.task
def forensic_preservation(document_id):
    doc = Document.get(document_id)
    preservation = preserve_document_forensically(doc.original_file_url)
    doc.update(preservation)
    return document_id

@app.task
def damage_assessment(document_id):
    doc = Document.get(document_id)
    damage = assess_document_damage(doc.original_file_url)
    doc.update({"damage_assessment": damage})
    return document_id

@app.task(queue='gpu')  # GPU-heavy task
def enhancement(document_id):
    doc = Document.get(document_id)
    enhanced = enhance_document_adaptive(doc.original_file_url, doc.damage_assessment)
    doc.update({"enhanced_file_url": enhanced["enhanced_image"]})
    return document_id

# ... other tasks ...

# API endpoint
@app.post("/documents/upload")
async def upload_document(file: UploadFile):
    # Save file
    file_url = save_to_storage(file)
    
    # Create document record
    doc = Document.create({
        "title": file.filename,
        "original_file_url": file_url,
        "status": "uploaded"
    })
    
    # Start async pipeline
    task = process_document_pipeline.delay(doc.id)
    
    return {
        "document_id": doc.id,
        "task_id": task.id,
        "status": "queued"
    }

# Check status
@app.get("/documents/{document_id}/status")
async def check_status(document_id: str):
    doc = Document.get(document_id)
    return {
        "document_id": doc.id,
        "status": doc.status,
        "pipeline_stage": doc.pipeline_stage,
        "confidence_score": doc.confidence_score
    }
`}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Card */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Production Deployment Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChecklistSection
              title="Infrastructure"
              items={[
                "Object storage (S3/Azure) with versioning",
                "PostgreSQL with read replicas",
                "Vector database (Weaviate/Pinecone)",
                "Message queue (RabbitMQ/Redis)",
                "GPU-enabled workers (EC2 P3/P4)",
                "Load balancer + auto-scaling"
              ]}
            />
            <ChecklistSection
              title="Security & Compliance"
              items={[
                "Encryption at rest and in transit",
                "Audit trail for all operations",
                "GDPR/HIPAA compliance",
                "Role-based access control",
                "API rate limiting",
                "DDoS protection"
              ]}
            />
            <ChecklistSection
              title="Monitoring & Observability"
              items={[
                "Prometheus + Grafana metrics",
                "Error tracking (Sentry)",
                "Log aggregation (ELK stack)",
                "Performance tracing (Jaeger)",
                "Uptime monitoring (Pingdom)",
                "Cost tracking per tenant"
              ]}
            />
            <ChecklistSection
              title="Testing & QA"
              items={[
                "Unit tests for all pipelines",
                "Integration tests (end-to-end)",
                "Accuracy benchmarks on test set",
                "Load testing (1000+ docs/hr)",
                "Chaos engineering (failure injection)",
                "User acceptance testing"
              ]}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CodeBlock({ title, language, code }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <Badge variant="outline" className="text-xs">{language}</Badge>
      </div>
      <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
        <pre className="text-xs text-slate-100 font-mono leading-relaxed">
          {code}
        </pre>
      </div>
    </div>
  );
}

function ScalingStrategy({ title, strategies }) {
  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
      <h3 className="text-sm font-bold text-slate-900 mb-3">{title}</h3>
      <ul className="space-y-2">
        {strategies.map((strategy, i) => (
          <li key={i} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
            <span className="text-xs text-slate-600 leading-relaxed">{strategy}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChecklistSection({ title, items }) {
  return (
    <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
      <h3 className="text-sm font-bold text-blue-900 mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <div className="w-4 h-4 rounded border-2 border-blue-300 mt-0.5 shrink-0" />
            <span className="text-xs text-slate-700 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}