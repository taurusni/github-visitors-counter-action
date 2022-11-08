import { info } from '@actions/core'
import ChartJSImage from 'chart.js-image'
import * as fs from 'fs-extra'
import { saveOther } from './cache'
import * as vars from './vars'
import * as path from './path'
import * as cache from './cache'
// incomplete TBD
export async function updateSummaryChart(repositoryName, repositoryIdentifier) {
  const cachePath = await path.getCacheFolderPath(repositoryIdentifier)
  const files = (await fs.readdir(cachePath))
    .filter(file => file !== vars.SUMMARY_FILENAME)
    .sort((left, right) => (+(left.split('.')[0])) - (+(right.split('.')[0])))
  info(`Available files are: ${files}`)
  const count = []
  const uniques = []
  for (const file of files) {
    const viewModels = await cache.readCachaedRecordJson(`${cachePath}/${file}`)
    viewModels.forEach(viewModel => {
      count.push(viewModel.getCount())
      uniques.push(viewModel.getUniques())
    })
  }
  info(`Count: ${count}`)
  info(`Uniques: ${uniques}`)
  const chartPath = await path.getChartFilePath(repositoryIdentifier, vars.CHART_FILENAME)
  const lineChart = new ChartJSImage().chart({
    'type': 'line',
    'data': {
      'datasets': [
        {
          'label': 'Unique Data',
          'borderColor': 'rgb(255,+99,+132)',
          'backgroundColor': 'rgba(255,+99,+132,+.5)',
          'data': uniques
        },
        {
          'label': 'Count Data',
          'borderColor': 'rgb(54,+162,+235)',
          'backgroundColor': 'rgba(54,+162,+235,+.5)',
          'data': count
        }
      ]
    },
    'options': {
      'title': {
        'display': true,
        'text': `${repositoryName} Summary`
      },
      'scales': {
        'xAxes': [
          {
            'scaleLabel': {
              'display': true,
              'labelString': 'Timestamp'
            }
          }
        ],
        'yAxes': [
          {
            'stacked': true,
            'scaleLabel': {
              'display': true,
              'labelString': 'Value'
            }
          }
        ]
      }
    }
  })
    .backgroundColor('white')
    .width(300)
    .height(300)
  const chartBuffer = await lineChart.toBuffer()
  await saveOther(chartPath, chartBuffer)
}
