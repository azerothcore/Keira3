export const WIKI_BASE_URL = 'http://www.azerothcore.org/wiki/';
export const KEIRA3_REPO_URL = 'https://github.com/azerothcore/Keira3';
export const AC_FORUM_URL = 'https://github.com/azerothcore/forum/issues';
export const AC_DISCORD_URL = 'https://discordapp.com/channels/217589275766685707/536630256048799744';
export const PAYPAL_DONATE_URL = 'https://www.paypal.me/francesco92dev';
export const LATEST_RELEASE_API_URL = 'https://api.github.com/repos/azerothcore/Keira3/releases/latest';

/**
 * `conditions.SourceGroup` is the smart_scripts event id shifted by one, so 0 can still mean "no group".
 * The rest of the key is `SourceEntry` = entryorguid and `SourceId` = source_type; see
 * `ConditionMgr::GetConditionsForSmartEvent`, which looks the store up at `eventId + 1`.
 */
export const SMART_EVENT_CONDITION_GROUP_OFFSET = 1;
