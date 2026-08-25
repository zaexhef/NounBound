import { createAudioPlayer } from "expo-audio";

/**
 * Optional restrained audio cues. Sound is never required to play.
 * Players can disable sound in settings.
 */
export type CueKind = "select" | "success" | "incorrect" | "restore" | "chain";

export async function playCue(
  kind: CueKind,
  enabled: boolean,
): Promise<void> {
  if (!enabled) return;
  // Prototype ships without bundled SFX files; keep a no-op-safe hook so
  // future assets can plug in without changing call sites.
  void kind;
  void createAudioPlayer;
}
