/** Statuts renvoyés par les actions serveur des formulaires (partagés navigateur / serveur). */
export type FormStatus =
  | "idle"
  | "invalid" // données refusées par la validation
  | "sent" // email accepté par le service d'envoi (seul cas de confirmation)
  | "unconfigured" // service d'envoi non configuré : rien n'a été envoyé
  | "failed" // le service d'envoi a refusé ou n'a pas répondu
  | "limited" // trop d'envois depuis la même connexion
  | "too-fast" // envoi quasi instantané : nouvel essai demandé
  | "blocked"; // champ piège rempli : rien n'est envoyé, aucun faux succès

/** Nom du champ piège (invisible). Choisi pour ne jamais être rempli par l'auto-complétion des navigateurs. */
export const HONEYPOT_FIELD = "hp_confirm";
