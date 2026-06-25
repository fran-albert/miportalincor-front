import { Conversation } from "@/types/Conversations";

export interface ConversationDisplayIdentity {
  displayName: string;
  avatarName: string;
  profileImageUrl: string | null;
  whatsappName: string | null;
  declaredContactName: string | null;
  patientName: string | null;
  listContext: string | null;
  headerContext: string;
  panelContext: string | null;
}

export function getConversationDisplayIdentity(
  conversation: Conversation,
): ConversationDisplayIdentity {
  const whatsappName = normalizeText(conversation.profileName);
  const declaredContactName = normalizeText(conversation.contactDisplayName);
  const patientName = normalizeText(
    [conversation.patient.firstName, conversation.patient.lastName]
      .filter(Boolean)
      .join(" "),
  );
  const phone = formatPhoneDisplay(conversation.patient.phone);
  const displayName = patientName ?? declaredContactName ?? whatsappName ?? phone;

  const contextParts = [
    shouldShowSecondaryName(patientName, declaredContactName)
      ? `Declarado: ${declaredContactName}`
      : null,
    patientName && whatsappName && !sameVisibleName(patientName, whatsappName)
      ? `WhatsApp: ${whatsappName}`
      : null,
    !patientName &&
    declaredContactName &&
    whatsappName &&
    !sameVisibleName(declaredContactName, whatsappName)
      ? `WhatsApp: ${whatsappName}`
      : null,
    (patientName || declaredContactName) && conversation.patient.dni
      ? `DNI ${conversation.patient.dni}`
      : null,
    displayName !== phone ? phone : null,
  ].filter(Boolean) as string[];
  const visibleContext = contextParts.join(" · ");
  const fallbackContext =
    displayName === phone ? "Sin paciente identificado" : phone;

  return {
    displayName,
    avatarName: displayName,
    profileImageUrl: normalizeText(conversation.profileImageUrl),
    whatsappName,
    declaredContactName,
    patientName,
    listContext: visibleContext || null,
    headerContext: visibleContext || fallbackContext,
    panelContext: visibleContext || null,
  };
}

function sameVisibleName(
  first: string | null | undefined,
  second: string | null | undefined,
): boolean {
  return (
    !!first &&
    !!second &&
    first.toLocaleLowerCase("es-AR") === second.toLocaleLowerCase("es-AR")
  );
}

function shouldShowSecondaryName(
  patientName: string | null,
  declaredContactName: string | null,
): boolean {
  return (
    !!patientName &&
    !!declaredContactName &&
    !sameVisibleName(patientName, declaredContactName)
  );
}

function normalizeText(value: string | null | undefined): string | null {
  const normalized = value
    ?.normalize("NFKC")
    .split("")
    .filter((character) => !isInvisibleProfileNameCharacter(character))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return normalized || null;
}

function isInvisibleProfileNameCharacter(character: string): boolean {
  const code = character.codePointAt(0) ?? 0;
  return (
    code <= 0x001f ||
    (code >= 0x007f && code <= 0x009f) ||
    code === 0x00ad ||
    code === 0x061c ||
    (code >= 0x200b && code <= 0x200f) ||
    (code >= 0x202a && code <= 0x202e) ||
    (code >= 0x2060 && code <= 0x206f) ||
    code === 0xfeff
  );
}

function formatPhoneDisplay(value: string | null | undefined): string {
  const normalized = normalizeText(value);
  if (!normalized) return "Contacto sin telefono";
  if (normalized.startsWith("+")) return normalized;
  const digitsOnly = normalized.replace(/\D/g, "");
  return digitsOnly.length >= 8 && digitsOnly === normalized
    ? `+${normalized}`
    : normalized;
}
