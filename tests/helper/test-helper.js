function getPasteListXml(
  pasteKey,
  pasteName,
  pasteVisibility,
  pasteExpiryDate,
  pasteFormat
) {
  return `
        <paste>
            <paste_key>${pasteKey}</paste_key>
            <paste_date>1297953260</paste_date>
            <paste_title>${pasteName}</paste_title>
            <paste_size>15</paste_size>
            <paste_expire_date>${pasteExpiryDate}</paste_expire_date>
            <paste_private>${pasteVisibility}</paste_private>
            <paste_format_long>${pasteFormat}</paste_format_long>
            <paste_format_short>${pasteFormat}</paste_format_short>
            <paste_url>https://pastebin.com/${pasteKey}</paste_url>
            <paste_hits>15</paste_hits>
        </paste>
        `;
}

function getUserXml(userName, privacy, email, premium) {
  return `
    <user>
        <user_name>${userName}</user_name>
        <user_format_short>text</user_format_short>
        <user_expiration>N</user_expiration>
        <user_avatar_url>https://pastebin.com/cache/a/1.jpg</user_avatar_url>
        <user_private>${privacy}</user_private>
        <user_website>https://myawesomesite.com</user_website>
        <user_email>${email}</user_email>
        <user_location>New York</user_location>
        <user_account_type>${premium}</user_account_type>
</user>
  `;
}

module.exports = {
  getPasteListXml,
  getUserXml,
};
