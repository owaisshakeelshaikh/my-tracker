'use client'

import { useState, useEffect } from 'react'
import { getSettings, updateSettings } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [formData, setFormData] = useState({
    monthlySalary: 50000,
    requiredHours: 9,
    weeklyOff: 'Sunday',
    currency: '₹',
    hideSalary: false,
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const data = await getSettings()
    setSettings(data)
    setFormData({
      monthlySalary: data.monthlySalary,
      requiredHours: data.requiredHours,
      weeklyOff: data.weeklyOff,
      currency: data.currency,
      hideSalary: data.hideSalary || false,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const formDataObj = new FormData()
    formDataObj.append('monthlySalary', formData.monthlySalary.toString())
    formDataObj.append('requiredHours', formData.requiredHours.toString())
    formDataObj.append('weeklyOff', formData.weeklyOff)
    formDataObj.append('currency', formData.currency)
    formDataObj.append('hideSalary', formData.hideSalary ? 'on' : 'off')

    await updateSettings(formDataObj)
    await loadSettings()
    setIsSaving(false)
  }

  if (!settings) {
    return <div className="container mx-auto py-8 px-4">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Settings</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Attendance Settings</CardTitle>
            <CardDescription>
              Configure your monthly salary, working hours, and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="monthlySalary">Monthly Salary</Label>
                <Input
                  id="monthlySalary"
                  name="monthlySalary"
                  type="number"
                  step="0.01"
                  value={formData.monthlySalary}
                  onChange={(e) => setFormData({ ...formData, monthlySalary: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requiredHours">Required Working Hours Per Day</Label>
                <Input
                  id="requiredHours"
                  name="requiredHours"
                  type="number"
                  step="0.5"
                  value={formData.requiredHours}
                  onChange={(e) => setFormData({ ...formData, requiredHours: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weeklyOff">Weekly Off Day</Label>
                <Select 
                  value={formData.weeklyOff} 
                  onValueChange={(value) => setFormData({ ...formData, weeklyOff: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency Symbol</Label>
                <Input
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="hideSalary">Hide Salary Information</Label>
                <Switch
                  id="hideSalary"
                  name="hideSalary"
                  checked={formData.hideSalary}
                  onCheckedChange={(checked) => setFormData({ ...formData, hideSalary: checked })}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
