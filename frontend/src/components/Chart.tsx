import React from 'react'
import ReactApexChart from 'react-apexcharts'

interface ChartProps {
  series: ApexCharts.ApexOptions['series']
  options: ApexCharts.ApexOptions
  type?: 'line' | 'bar' | 'pie' | 'donut' | 'area'
  height?: number | string
  width?: number | string
}

export default function Chart({ series, options, type = 'line', height = 300, width = '100%' }: ChartProps) {
  return (
    <ReactApexChart
      series={series}
      options={options}
      type={type}
      height={height}
      width={width}
    />
  )
}
