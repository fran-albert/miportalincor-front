import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Building2, FileBadge2, RefreshCcw, Save, ShieldCheck, Signature, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Doctor } from "@/types/Doctor/Doctor";
import {
  LaborReportBrandingConfig,
  LaborReportSignaturePresentationMode,
  LaborReportSignatureMode,
  LaborReportSignatureSection,
  LaborReportSigner,
  ReplaceLaborReportSignaturePoliciesInput,
  ReplaceLaborReportSignersInput,
  UpdateLaborReportBrandingConfigInput,
  UpsertLaborReportSignaturePolicyInput,
  UpsertLaborReportSignerInput,
} from "@/types/Labor-Report-Branding-Config/LaborReportBrandingConfig";
import { useDoctors } from "@/hooks/Doctor/useDoctors";
import { useDoctorWithSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import { useLaborReportBrandingConfig } from "@/hooks/Labor-Report-Branding-Config/useLaborReportBrandingConfig";
import { useLaborReportBrandingConfigMutations } from "@/hooks/Labor-Report-Branding-Config/useLaborReportBrandingConfigMutations";
import {
  BrandingHeaderPreview,
  PolicyPreviewList,
  SignerVisualPreview,
} from "./PreviewBlocks";
import { buildPreviewBrandingConfig } from "./preview-config";

const POLICY_SECTIONS: Array<{
  section: LaborReportSignatureSection;
  title: string;
  description: string;
}> = [
  {
    section: "cover",
    title: "Portada y cierre",
    description:
      "Aplica a la portada del informe, conclusión y cierre documental.",
  },
  {
    section: "clinical",
    title: "Páginas clínicas",
    description:
      "Aplica a las páginas del examen clínico y físico del colaborador.",
  },
  {
    section: "studies",
    title: "Complementarios",
    description:
      "Aplica a los estudios adjuntos y páginas documentales de apoyo.",
  },
];

const DEFAULT_REPORT_TYPE = "PREOCUPACIONAL";

const emptySignerDraft = (): UpsertLaborReportSignerInput => ({
  signerKey: `signer_${Date.now()}`,
  name: "",
  license: "",
  specialty: "",
  signatureUrl: "",
  sealUrl: "",
  stampText: "",
  hcDoctorUserId: "",
  signerType: "institutional",
  active: true,
});

const normalizeNullable = (value?: string | null) => value?.trim() || "";

const mapBrandingDraft = (
  config: LaborReportBrandingConfig
): UpdateLaborReportBrandingConfigInput => ({
  institutionName: config.institutionName,
  logoUrl: config.logoUrl ?? "",
  headerAddress: config.headerAddress ?? "",
  footerLegalText: config.footerLegalText ?? "",
  active: config.active,
});

const mapSignerDrafts = (
  signers: LaborReportSigner[]
): UpsertLaborReportSignerInput[] =>
  signers.map((signer) => ({
    id: signer.id,
    signerKey: signer.signerKey,
    name: signer.name,
    license: signer.license ?? "",
    specialty: signer.specialty ?? "",
    signatureUrl: signer.signatureUrl ?? "",
    sealUrl: signer.sealUrl ?? "",
    stampText: signer.stampText ?? "",
    hcDoctorUserId: signer.hcDoctorUserId ?? "",
    signerType: signer.signerType,
    active: signer.active,
  }));

const mapPolicyDrafts = (
  config: LaborReportBrandingConfig
): UpsertLaborReportSignaturePolicyInput[] =>
  POLICY_SECTIONS.map((entry) => {
    const currentPolicy = config.policies.find(
      (policy) =>
        policy.reportType === DEFAULT_REPORT_TYPE && policy.section === entry.section
    );

    return {
      id: currentPolicy?.id,
      reportType: DEFAULT_REPORT_TYPE,
      section: entry.section,
      mode: currentPolicy?.mode ?? "institutional_signer",
      presentationMode:
        currentPolicy?.presentationMode ??
        (entry.section === "clinical"
          ? "signature_and_text"
          : "signature_seal_and_text"),
      signerId: currentPolicy?.signer?.id ?? null,
    };
  });

const sameJson = (left: unknown, right: unknown) =>
  JSON.stringify(left) === JSON.stringify(right);

const getDoctorPreviewLabel = (doctor: Doctor) =>
  `${doctor.firstName} ${doctor.lastName}`.trim();

const getDoctorPreviewSpecialty = (doctor: Doctor) =>
  doctor.specialities?.[0]?.name?.trim() || "Especialidad no configurada";

export default function LaborReportBrandingConfigManager() {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useLaborReportBrandingConfig({
    fallbackOnError: false,
  });

  const {
    updateConfigMutation,
    replaceSignersMutation,
    replacePoliciesMutation,
  } = useLaborReportBrandingConfigMutations();

  const [brandingDraft, setBrandingDraft] =
    useState<UpdateLaborReportBrandingConfigInput | null>(null);
  const [signerDrafts, setSignerDrafts] = useState<UpsertLaborReportSignerInput[]>(
    []
  );
  const [policyDrafts, setPolicyDrafts] = useState<
    UpsertLaborReportSignaturePolicyInput[]
  >([]);
  const [previewDoctorId, setPreviewDoctorId] = useState<string>("__sample__");

  const {
    doctors = [],
    isLoading: isLoadingDoctors,
  } = useDoctors({
    auth: true,
    fetchDoctors: true,
  });

  const availablePreviewDoctors = useMemo(
    () =>
      doctors
        .filter((doctor) => doctor.active !== false && Boolean(doctor.userId))
        .sort((left, right) =>
          getDoctorPreviewLabel(left).localeCompare(getDoctorPreviewLabel(right), "es")
        ),
    [doctors]
  );

  const selectedPreviewDoctor = useMemo(
    () =>
      availablePreviewDoctors.find(
        (doctor) => String(doctor.userId) === previewDoctorId
      ) ?? null,
    [availablePreviewDoctors, previewDoctorId]
  );

  const { data: previewDoctorSignatures, isLoading: isLoadingPreviewDoctorSignatures } =
    useDoctorWithSignatures({
      id: previewDoctorId,
      auth: previewDoctorId !== "__sample__",
    });

  useEffect(() => {
    if (!data) return;

    setBrandingDraft(mapBrandingDraft(data));
    setSignerDrafts(mapSignerDrafts(data.signers));
    setPolicyDrafts(mapPolicyDrafts(data));
  }, [data]);

  const activeInstitutionalSigners = useMemo(
    () =>
      signerDrafts.filter(
        (signer) => signer.active !== false && signer.signerType === "institutional"
      ),
    [signerDrafts]
  );

  const currentInstitutionalSigner = activeInstitutionalSigners[0] ?? null;
  const previewExamDoctor = useMemo(() => {
    if (!selectedPreviewDoctor) return undefined;

    return {
      name:
        previewDoctorSignatures?.fullName?.trim() ||
        getDoctorPreviewLabel(selectedPreviewDoctor),
      specialty:
        previewDoctorSignatures?.specialty?.trim() ||
        getDoctorPreviewSpecialty(selectedPreviewDoctor),
      license:
        previewDoctorSignatures?.matricula?.trim() ||
        selectedPreviewDoctor.matricula?.trim() ||
        "Matrícula no configurada",
      signatureUrl: previewDoctorSignatures?.signatureDataUrl || "",
      sealUrl: previewDoctorSignatures?.sealDataUrl ?? null,
      stampText:
        previewDoctorSignatures?.stampText?.trim() ||
        selectedPreviewDoctor.stampText?.trim() ||
        null,
    };
  }, [previewDoctorSignatures, selectedPreviewDoctor]);

  const previewDoctorLabel = selectedPreviewDoctor
    ? getDoctorPreviewLabel(selectedPreviewDoctor)
    : null;

  const previewConfig = useMemo(() => {
    if (!data || !brandingDraft) return null;

    return buildPreviewBrandingConfig({
      baseConfig: data,
      brandingDraft,
      signerDrafts,
      policyDrafts,
    });
  }, [brandingDraft, data, policyDrafts, signerDrafts]);

  const brandingDirty =
    !!data &&
    !!brandingDraft &&
    !sameJson(mapBrandingDraft(data), brandingDraft);

  const signersDirty =
    !!data && !sameJson(mapSignerDrafts(data.signers), signerDrafts);

  const policiesDirty = !!data && !sameJson(mapPolicyDrafts(data), policyDrafts);

  const syncFromResponse = (nextConfig: LaborReportBrandingConfig) => {
    setBrandingDraft(mapBrandingDraft(nextConfig));
    setSignerDrafts(mapSignerDrafts(nextConfig.signers));
    setPolicyDrafts(mapPolicyDrafts(nextConfig));
  };

  const handleBrandingField = (
    field: keyof UpdateLaborReportBrandingConfigInput,
    value: string | boolean
  ) => {
    setBrandingDraft((current) => ({
      ...(current ?? {}),
      [field]: value,
    }));
  };

  const handleSignerField = (
    index: number,
    field: keyof UpsertLaborReportSignerInput,
    value: string | boolean
  ) => {
    setSignerDrafts((current) =>
      current.map((signer, signerIndex) =>
        signerIndex === index ? { ...signer, [field]: value } : signer
      )
    );
  };

  const handlePolicyField = (
    section: LaborReportSignatureSection,
    field: keyof UpsertLaborReportSignaturePolicyInput,
    value: string | number | null
  ) => {
    setPolicyDrafts((current) =>
      current.map((policy) => {
        if (policy.section !== section) return policy;

        if (field === "mode") {
          return {
            ...policy,
            mode: value as LaborReportSignatureMode,
            signerId:
              value === "institutional_signer" ? policy.signerId ?? null : null,
          };
        }

        return { ...policy, [field]: value };
      })
    );
  };

  const addSigner = () => {
    setSignerDrafts((current) => [...current, emptySignerDraft()]);
  };

  const removeSigner = (index: number) => {
    setSignerDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSaveBranding = async () => {
    if (!brandingDraft) return;

    try {
      const nextConfig = await updateConfigMutation.mutateAsync({
        institutionName: normalizeNullable(brandingDraft.institutionName),
        logoUrl: normalizeNullable(brandingDraft.logoUrl as string | null) || null,
        headerAddress:
          normalizeNullable(brandingDraft.headerAddress as string | null) || null,
        footerLegalText:
          normalizeNullable(brandingDraft.footerLegalText as string | null) || null,
        active: brandingDraft.active ?? true,
      });

      syncFromResponse(nextConfig);
      toast.success("Branding institucional actualizado");
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudo guardar el branding institucional";
      toast.error(message);
    }
  };

  const handleSaveSigners = async () => {
    const payload: ReplaceLaborReportSignersInput = {
      signers: signerDrafts.map((signer, index) => ({
        ...signer,
        signerKey: normalizeNullable(signer.signerKey) || `signer_${index + 1}`,
        name: normalizeNullable(signer.name),
        license: normalizeNullable(signer.license) || null,
        specialty: normalizeNullable(signer.specialty) || null,
        signatureUrl: normalizeNullable(signer.signatureUrl) || null,
        sealUrl: normalizeNullable(signer.sealUrl) || null,
        stampText: normalizeNullable(signer.stampText) || null,
        hcDoctorUserId: normalizeNullable(signer.hcDoctorUserId) || null,
        active: signer.active ?? true,
      })),
    };

    if (payload.signers.some((signer) => !signer.name)) {
      toast.error("Cada firmante debe tener al menos un nombre");
      return;
    }

    try {
      const nextConfig = await replaceSignersMutation.mutateAsync(payload);
      syncFromResponse(nextConfig);
      toast.success("Firmantes actualizados");
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudieron guardar los firmantes";
      toast.error(message);
    }
  };

  const handleSavePolicies = async () => {
    if (signersDirty) {
      toast.error("Guardá los firmantes antes de modificar la política");
      return;
    }

    const payload: ReplaceLaborReportSignaturePoliciesInput = {
      policies: policyDrafts.map((policy) => ({
        ...policy,
        reportType: DEFAULT_REPORT_TYPE,
        signerId:
          policy.mode === "institutional_signer" ? policy.signerId ?? null : null,
      })),
    };

    if (
      payload.policies.some(
        (policy) =>
          policy.mode === "institutional_signer" && !policy.signerId
      )
    ) {
      toast.error(
        "Cada sección con modo institucional debe tener un firmante seleccionado"
      );
      return;
    }

    try {
      const nextConfig = await replacePoliciesMutation.mutateAsync(payload);
      syncFromResponse(nextConfig);
      toast.success("Política de firmas actualizada");
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudo guardar la política de firmas";
      toast.error(message);
    }
  };

  if (isLoading || !brandingDraft) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Cargando configuración documental...</CardTitle>
            <CardDescription>
              Estamos preparando el branding institucional y las políticas activas.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="destructive">
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>No se pudo cargar la configuración documental</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            {error instanceof Error
              ? error.message
              : "El backend no devolvió una configuración válida."}
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-greenPrimary/20 bg-white">
          <CardHeader className="pb-3">
            <CardDescription>Firmante institucional actual</CardDescription>
            <CardTitle className="text-lg">
              {currentInstitutionalSigner?.name || "Sin firmante institucional"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>{currentInstitutionalSigner?.specialty || "Sin especialidad cargada"}</p>
            <p>{currentInstitutionalSigner?.license || "Sin matrícula cargada"}</p>
          </CardContent>
        </Card>

        <Card className="border-greenPrimary/20 bg-white">
          <CardHeader className="pb-3">
            <CardDescription>Política clínica</CardDescription>
            <CardTitle className="text-lg">
              {policyDrafts.find((policy) => policy.section === "clinical")?.mode ===
              "exam_doctor"
                ? "Firma médico del examen"
                : "Firma institucional"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            Las páginas clínicas del informe siguen esta regla al regenerar el PDF.
          </CardContent>
        </Card>

        <Card className="border-greenPrimary/20 bg-white">
          <CardHeader className="pb-3">
            <CardDescription>Estado de configuración</CardDescription>
            <CardTitle className="text-lg flex items-center gap-2">
              Configuración activa
              <Badge variant={data.active ? "success" : "warning"}>
                {data.active ? "Activa" : "Inactiva"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-sm text-gray-600">
            <span>Aplica hoy a {DEFAULT_REPORT_TYPE}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="h-auto w-full justify-start gap-2 rounded-xl border bg-white p-2">
          <TabsTrigger value="branding" className="gap-2">
            <Building2 className="h-4 w-4" />
            Branding institucional
          </TabsTrigger>
          <TabsTrigger value="signers" className="gap-2">
            <Signature className="h-4 w-4" />
            Firmantes
          </TabsTrigger>
          <TabsTrigger value="policies" className="gap-2">
            <FileBadge2 className="h-4 w-4" />
            Política de firmas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branding institucional</CardTitle>
              <CardDescription>
                Configurá la identidad base del emisor documental que se usa en
                preview y PDF.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="institutionName">Nombre institucional</Label>
                    <Input
                      id="institutionName"
                      value={brandingDraft.institutionName ?? ""}
                      onChange={(event) =>
                        handleBrandingField("institutionName", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      placeholder="https://..."
                      value={(brandingDraft.logoUrl as string | null) ?? ""}
                      onChange={(event) =>
                        handleBrandingField("logoUrl", event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="headerAddress">Dirección / cabecera</Label>
                    <Textarea
                      id="headerAddress"
                      rows={4}
                      value={(brandingDraft.headerAddress as string | null) ?? ""}
                      onChange={(event) =>
                        handleBrandingField("headerAddress", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footerLegalText">Texto legal de pie</Label>
                    <Textarea
                      id="footerLegalText"
                      rows={4}
                      value={(brandingDraft.footerLegalText as string | null) ?? ""}
                      onChange={(event) =>
                        handleBrandingField("footerLegalText", event.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-200 p-4">
                  <div>
                    <p className="font-medium text-gray-900">Configuración activa</p>
                    <p className="text-sm text-gray-600">
                      Si la desactivás, esta configuración deja de ser la fuente
                      principal para informes laborales.
                    </p>
                  </div>
                  <Switch
                    checked={brandingDraft.active ?? true}
                    onCheckedChange={(checked) =>
                      handleBrandingField("active", checked)
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveBranding}
                    disabled={!brandingDirty || updateConfigMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Guardar branding
                  </Button>
                </div>
              </div>

              {previewConfig && <BrandingHeaderPreview config={previewConfig} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Firmantes institucionales</CardTitle>
              <CardDescription>
                Definí quiénes pueden firmar y sellar los distintos bloques del
                informe laboral.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {signerDrafts.map((signer, index) => (
                <div
                  key={`${signer.id ?? "new"}-${index}`}
                  className="grid gap-4 rounded-xl border border-gray-200 p-4 xl:grid-cols-[minmax(0,1fr)_280px]"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {signer.name || `Firmante ${index + 1}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Configurá nombre, matrícula, firma y el texto profesional
                          que acompaña la firma en el informe.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSigner(index)}
                        disabled={signerDrafts.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Clave técnica (uso interno)</Label>
                        <Input
                          value={signer.signerKey}
                          onChange={(event) =>
                            handleSignerField(index, "signerKey", event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                          value={signer.name}
                          onChange={(event) =>
                            handleSignerField(index, "name", event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select
                          value={signer.signerType}
                          onValueChange={(value) =>
                            handleSignerField(index, "signerType", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="institutional">Institucional</SelectItem>
                            <SelectItem value="doctor-linked">
                              Vinculado a médico
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Matrícula</Label>
                        <Input
                          value={signer.license ?? ""}
                          onChange={(event) =>
                            handleSignerField(index, "license", event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Especialidad</Label>
                        <Input
                          value={signer.specialty ?? ""}
                          onChange={(event) =>
                            handleSignerField(index, "specialty", event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>ID médico HC (uso técnico)</Label>
                        <Input
                          value={signer.hcDoctorUserId ?? ""}
                          onChange={(event) =>
                            handleSignerField(
                              index,
                              "hcDoctorUserId",
                              event.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2 xl:col-span-2">
                        <Label>Firma URL</Label>
                        <Input
                          placeholder="https://..."
                          value={signer.signatureUrl ?? ""}
                          onChange={(event) =>
                            handleSignerField(
                              index,
                              "signatureUrl",
                              event.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sello URL</Label>
                        <Input
                          placeholder="https://..."
                          value={signer.sealUrl ?? ""}
                          onChange={(event) =>
                            handleSignerField(index, "sealUrl", event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2 xl:col-span-3">
                        <Label>Texto profesional impreso</Label>
                        <Textarea
                          rows={4}
                          placeholder={"BONIFACIO Ma. CECILIA\nEspecialista en Medicina del Trabajo\nM.P. 96533 - M.L. 7299"}
                          value={signer.stampText ?? ""}
                          onChange={(event) =>
                            handleSignerField(index, "stampText", event.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">Firmante activo</p>
                        <p className="text-sm text-gray-600">
                          Solo los firmantes activos quedan disponibles en la política.
                        </p>
                      </div>
                      <Switch
                        checked={signer.active ?? true}
                        onCheckedChange={(checked) =>
                          handleSignerField(index, "active", checked)
                        }
                      />
                    </div>
                  </div>

                  <SignerVisualPreview signer={signer} />
                </div>
              ))}

              <div className="flex items-center justify-between">
                <Button type="button" variant="outline" onClick={addSigner}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar firmante
                </Button>
                <Button
                  onClick={handleSaveSigners}
                  disabled={!signersDirty || replaceSignersMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Guardar firmantes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Política de firmas</CardTitle>
              <CardDescription>
                Definí quién firma cada bloque documental del informe laboral.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Alcance actual</AlertTitle>
                <AlertDescription>
                  Esta primera versión administra la política de firmas para{" "}
                  <strong>{DEFAULT_REPORT_TYPE}</strong>. Si cambiás firmantes, guardalos
                  primero antes de ajustar la política.
                </AlertDescription>
              </Alert>

              {POLICY_SECTIONS.map((entry, index) => {
                const currentPolicy = policyDrafts.find(
                  (policy) => policy.section === entry.section
                );

                if (!currentPolicy) {
                  return null;
                }

                return (
                  <div key={entry.section} className="space-y-4">
                    {index > 0 && <Separator />}
                    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_1fr_1fr] lg:items-end">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">{entry.title}</p>
                        <p className="text-sm text-gray-600">{entry.description}</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Modo de firma</Label>
                        <Select
                          value={currentPolicy.mode}
                          onValueChange={(value) =>
                            handlePolicyField(entry.section, "mode", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="institutional_signer">
                              Firmante institucional
                            </SelectItem>
                            <SelectItem value="exam_doctor">
                              Médico del examen
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Presentación visual</Label>
                        <Select
                          value={currentPolicy.presentationMode}
                          onValueChange={(value) =>
                            handlePolicyField(
                              entry.section,
                              "presentationMode",
                              value as LaborReportSignaturePresentationMode
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="signature_and_text">
                              Firma + texto
                            </SelectItem>
                            <SelectItem value="signature_seal_and_text">
                              Firma + sello + texto
                            </SelectItem>
                            <SelectItem value="text_only">Solo texto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Firmante institucional</Label>
                        <Select
                          value={
                            currentPolicy.signerId
                              ? String(currentPolicy.signerId)
                              : "__none__"
                          }
                          onValueChange={(value) =>
                            handlePolicyField(
                              entry.section,
                              "signerId",
                              value === "__none__" ? null : Number(value)
                            )
                          }
                          disabled={currentPolicy.mode !== "institutional_signer"}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar firmante" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">
                              Sin firmante institucional
                            </SelectItem>
                            {activeInstitutionalSigners.map((signer) => (
                              <SelectItem
                                key={signer.id ?? signer.signerKey}
                                value={String(signer.id)}
                              >
                                {signer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                );
              })}

              {previewConfig && (
                <>
                  <div className="grid gap-4 rounded-xl border border-dashed border-gray-200 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">
                        Médico de ejemplo para vista previa
                      </p>
                      <p className="text-sm text-gray-600">
                        Solo cambia la demo visual de las páginas clínicas en esta
                        pantalla. No modifica ningún examen real.
                      </p>
                    </div>

                    <div className="space-y-2 md:min-w-80">
                      <Label htmlFor="previewDoctorId">Médico de ejemplo</Label>
                      <Select
                        value={previewDoctorId}
                        onValueChange={setPreviewDoctorId}
                      >
                        <SelectTrigger id="previewDoctorId">
                          <SelectValue placeholder="Elegir médico de ejemplo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__sample__">
                            Usar demo genérica
                          </SelectItem>
                          {availablePreviewDoctors.map((doctor) => (
                            <SelectItem
                              key={String(doctor.userId)}
                              value={String(doctor.userId)}
                            >
                              {getDoctorPreviewLabel(doctor)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isLoadingDoctors && (
                        <p className="text-xs text-gray-500">
                          Cargando listado de médicos...
                        </p>
                      )}
                      {selectedPreviewDoctor && (
                        <p className="text-xs text-gray-500">
                          Vista previa clínica con {previewDoctorLabel}.
                        </p>
                      )}
                    </div>
                  </div>

                  <PolicyPreviewList
                    config={previewConfig}
                    reportType={DEFAULT_REPORT_TYPE}
                    previewExamDoctor={previewExamDoctor}
                    previewExamDoctorLabel={previewDoctorLabel}
                    isPreviewDoctorLoading={isLoadingPreviewDoctorSignatures}
                  />
                </>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleSavePolicies}
                  disabled={
                    !policiesDirty || signersDirty || replacePoliciesMutation.isPending
                  }
                >
                  <Save className="mr-2 h-4 w-4" />
                  Guardar política
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
