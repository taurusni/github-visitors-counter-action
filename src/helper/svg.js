import { saveOther } from './cache'
import * as vars from './vars'
import * as path from './path'
import * as cache from './cache'

export async function updateSVGBadge(repositoryIdentifier) {
  const summaryFilePath = await path.getCacheFilePath(repositoryIdentifier, vars.SUMMARY_FILENAME)
  const summaryModel = await cache.readCachedSummaryJson(summaryFilePath)
  const countBadge = await path.getSVGFilePath(repositoryIdentifier, vars.COUNT_SVG_FILENAME)
  const uniqueBadge = await path.getSVGFilePath(repositoryIdentifier, vars.UNIQUE_SVG_FILENAME)
  const { count, uniques } = summaryModel.getModel()
  await createBadge(vars.COUNT_LABEL, count, countBadge)
  await createBadge(vars.UNIQUE_LABEL, uniques, uniqueBadge)
}

async function createBadge(name, value, fileName) {
  const badge = `<svg xmlns="http://www.w3.org/2000/svg"
     width="115" height="20" role="img" aria-label="Maintained?: yes">
    <title>Maintained?: yes</title>
    <linearGradient id="s" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <clipPath id="r">
        <rect width="115" height="20" rx="3" fill="#fff"/>
    </clipPath>
    <g clip-path="url(#r)">
        <rect width="50" height="20" fill="#555"/>
        <rect x="50" width="160" height="20" fill="#007ec6"/>
        <rect width="115" height="20" fill="url(#s)"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="110">
        <text x="250" y="140" transform="scale(.1)" fill="#fff">${name}</text>
        <text x="825" y="140" transform="scale(.1)" fill="#fff">${value}</text>
    </g>
</svg>`
  await saveOther(fileName, badge)
}
