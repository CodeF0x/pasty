export function getXml(
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
