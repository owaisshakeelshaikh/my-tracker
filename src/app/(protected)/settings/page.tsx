'use client'

import { useState, useEffect } from 'react'
import { getSettings, updateSettings } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { DollarSign, Clock, Calendar, Eye, EyeOff } from 'lucide-react'

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#020817] dark:to-[#0a0f1e]">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#020817] dark:to-[#0a0f1e]">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400">Configure your attendance preferences</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border border-slate-200 dark:border-slate-800 shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                <DollarSign className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                Salary & Currency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monthlySalary" className="text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Salary</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500">{formData.currency}</span>
                  <Input
                    id="monthlySalary"
                    name="monthlySalary"
                    type={formData.hideSalary ? 'password' : 'number'}
                    step="0.01"
                    value={formData.monthlySalary}
                    onChange={(e) => setFormData({ ...formData, monthlySalary: parseFloat(e.target.value) })}
                    required
                    className="pl-8 pr-10 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-500 hover:bg-transparent hover:text-slate-700 dark:hover:text-slate-300"
                    onClick={() => setFormData({ ...formData, hideSalary: !formData.hideSalary })}
                  >
                    {formData.hideSalary ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium text-slate-700 dark:text-slate-300">Currency Symbol</Label>
                <Input
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  required
                  className="w-20 bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-800 shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                Working Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requiredHours" className="text-sm font-medium text-slate-700 dark:text-slate-300">Required Hours Per Day</Label>
                <Input
                  id="requiredHours"
                  name="requiredHours"
                  type="number"
                  step="0.5"
                  value={formData.requiredHours}
                  onChange={(e) => setFormData({ ...formData, requiredHours: parseFloat(e.target.value) })}
                  required
                  className="bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-800 shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                Weekly Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weeklyOff" className="text-sm font-medium text-slate-700 dark:text-slate-300">Weekly Off Day</Label>
                <Select 
                  value={formData.weeklyOff} 
                  onValueChange={(value) => setFormData({ ...formData, weeklyOff: value })}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                    <SelectItem value="Sunday" className="text-slate-900 dark:text-white">Sunday</SelectItem>
                    <SelectItem value="Monday" className="text-slate-900 dark:text-white">Monday</SelectItem>
                    <SelectItem value="Tuesday" className="text-slate-900 dark:text-white">Tuesday</SelectItem>
                    <SelectItem value="Wednesday" className="text-slate-900 dark:text-white">Wednesday</SelectItem>
                    <SelectItem value="Thursday" className="text-slate-900 dark:text-white">Thursday</SelectItem>
                    <SelectItem value="Friday" className="text-slate-900 dark:text-white">Friday</SelectItem>
                    <SelectItem value="Saturday" className="text-slate-900 dark:text-white">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-800 shadow-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                <EyeOff className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="hideSalary" className="text-sm font-medium text-slate-700 dark:text-slate-300">Hide Salary</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Conceal salary information</p>
                </div>
                <Switch
                  id="hideSalary"
                  name="hideSalary"
                  checked={formData.hideSalary}
                  onCheckedChange={(checked) => setFormData({ ...formData, hideSalary: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <Button 
            type="submit" 
            size="lg"
            disabled={isSaving}
            onClick={handleSubmit}
            className="min-w-[140px]"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
