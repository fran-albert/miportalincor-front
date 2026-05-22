import { Conversation } from "@/types/Conversations";

export interface ConversationDisplayIdentity {
  displayName: string;
  avatarName: string;
  profileImageUrl: string | null;
  whatsappName: string | null;
  patientName: string | null;
  listContext: string | null;
  headerContext: string;
  panelContext: string | null;
}

export function getConversationDisplayIdentity(
  conversation: Conversation,
): ConversationDisplayIdentity {
  const whatsappName = normalizeText(conversation.profileName);
  const patientName = normalizeText(
    [conversation.patient.firstName, conversation.patient.lastName]
      .filter(Boolean)
      .join(" "),
  );
  const phone = conversation.patient.phone;
  const displayName = whatsappName ?? patientName ?? phone;
  const sameVisibleName =
    !!whatsappName &&
    !!patientName &&
    whatsappName.toLocaleLowerCase("es-AR") ===
      patientName.toLocaleLowerCase("es-AR");

  const clinicalParts = [
    patientName && !sameVisibleName ? patientName : null,
    conversation.patient.dni ? `DNI ${conversation.patient.dni}` : null,
  ].filter(Boolean) as string[];
  const clinicalContext = clinicalParts.join(" · ");
  const fallbackContext =
    displayName === phone ? "Sin paciente identificado" : phone;

  return {
    displayName,
    avatarName: displayName,
    profileImageUrl: normalizeText(conversation.profileImageUrl),
    whatsappName,
    patientName,
    listContext: clinicalContext || (whatsappName ? phone : null),
    headerContext: clinicalContext || fallbackContext,
    panelContext: clinicalContext || null,
  };
}

function normalizeText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized || null;
}
