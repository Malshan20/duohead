"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Download } from "lucide-react"
import Link from "next/link"

interface OrderStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderStatusDialog({ open, onOpenChange }: OrderStatusDialogProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)
    setError(null)
    setStatus(null)

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("status")
        .eq("customer_email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          setStatus("not_found")
        } else {
          setError(`Error: ${error.message}`)
        }
      } else {
        setStatus(data.status)
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setEmail("")
    setStatus(null)
    setError(null)
    setIsLoading(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) reset()
        onOpenChange(isOpen)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Check Order Status</DialogTitle>
          <DialogDescription>Enter your email to check your order status</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              disabled={isLoading}
            />
          </div>

          <Button onClick={checkStatus} disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700">
            {isLoading ? "Checking..." : "Check Status"}
          </Button>

          {/* Display Results */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {status === "not_found" && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-gray-600 font-medium">No Order Found</p>
              <p className="text-gray-500 text-sm">No order found with this email address.</p>
            </div>
          )}

          {status === "pending" && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 font-medium">Processing</p>
              <p className="text-yellow-600 text-sm">Your payment is being processed.</p>
            </div>
          )}

          {status === "paid" && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md space-y-3">
              <p className="text-green-800 font-medium">Paid</p>
              <p className="text-green-600 text-sm">Your order is complete! Download your PDF:</p>
              <Link href="https://drive.google.com/file/d/1FfCpCFZgl1CgNoIpxVPzx5r2MMuc-x6M/view?usp=sharing" target="_blank">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Download Digital Planner
                </Button>
              </Link>
            </div>
          )}

          {status === "failed" && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 font-medium">Failed</p>
              <p className="text-red-600 text-sm">Your payment failed. Please try purchasing again.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
