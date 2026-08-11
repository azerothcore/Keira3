export const WIKI_BASE_URL = 'http://www.azerothcore.org/wiki/';
export const KEIRA3_REPO_URL = 'https://github.com/azerothcore/Keira3';
export const AC_FORUM_URL = 'https://github.com/azerothcore/forum/issues';
export const AC_DISCORD_URL = 'https://discordapp.com/channels/217589275766685707/536630256048799744';
export const PAYPAL_DONATE_URL = 'https://www.paypal.me/francesco92dev';
export const LATEST_RELEASE_API_URL = 'https://api.github.com/repos/azerothcore/Keira3/releases/latest';

/** `CONDITION_SOURCE_TYPE_QUEST_AVAILABLE` — conditions gating whether a quest is offered. `SourceEntry` is the quest id. */
export const CONDITION_SOURCE_TYPE_QUEST_AVAILABLE = 19;

/**
 * `CONDITION_SOURCE_TYPE_SMART_EVENT` — conditions gating a `smart_scripts` event.
 * The core stores these as `SourceEntry` = entryorguid, `SourceId` = source_type and
 * `SourceGroup` = event id **+ 1** (see `ConditionMgr::GetConditionsForSmartEvent`).
 */
export const CONDITION_SOURCE_TYPE_SMART_EVENT = 22;
/** `conditions.SourceGroup` is the smart_scripts event id shifted by one, so 0 can mean "no group". */
export const SMART_EVENT_CONDITION_GROUP_OFFSET = 1;
