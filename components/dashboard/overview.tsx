"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  {
    name: "Jan",
    total: 1200,
  },
  {
    name: "Feb",
    total: 1900,
  },
  {
    name: "Mar",
    total: 2400,
  },
  {
    name: "Apr",
    total: 1800,
  },
  {
    name: "May",
    total: 2800,
  },
  {
    name: "Jun",
    total: 3800,
  },
  {
    name: "Jul",
    total: 4300,
  },
  {
    name: "Aug",
    total: 3900,
  },
  {
    name: "Sep",
    total: 4500,
  },
  {
    name: "Oct",
    total: 5200,
  },
  {
    name: "Nov",
    total: 4800,
  },
  {
    name: "Dec",
    total: 6100,
  },
]

export function Overview() {
  return (
    <ChartContainer
      config={{
        total: {
          label: "Revenue",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="total" radius={[4, 4, 0, 0]} className="fill-[var(--color-total)]" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
