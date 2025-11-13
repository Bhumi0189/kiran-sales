"use client"

import React, { useState } from 'react'
import { Ruler } from 'lucide-react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'

export default function SizeChartButton() {
  const [errored, setErrored] = useState(false)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="View size chart" aria-label="View size chart">
          <Ruler className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Size chart</DialogTitle>
          <DialogDescription>Refer to this chart to choose the best fit.</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {!errored ? (
            <img
              src="/size-chart.png"
              alt="Size chart"
              className="w-full h-auto max-h-[36rem] object-contain rounded"
              onError={() => setErrored(true)}
            />
          ) : (
            <div className="rounded-lg shadow-sm bg-background border border-border p-4">
              <div className="text-center mb-3">
                <p className="text-lg font-semibold">Size chart</p>
                <p className="text-sm text-muted-foreground">Widths / Lengths (cm)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-fixed border-collapse">
                  <thead>
                    <tr className="bg-muted/20">
                      <th className="border p-2 text-left">Size</th>
                      <th className="border p-2 text-left">Width (cm)</th>
                      <th className="border p-2 text-left">Length (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['XS', 40, 61],
                      ['S', 45, 66],
                      ['M', 50, 71],
                      ['L', 55, 76],
                      ['XL', 60, 81],
                    ].map(([sz, w, l]) => (
                      <tr key={String(sz)} className="odd:bg-background even:bg-muted/10">
                        <td className="border p-2 font-medium">{sz}</td>
                        <td className="border p-2">{w}</td>
                        <td className="border p-2">{l}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
