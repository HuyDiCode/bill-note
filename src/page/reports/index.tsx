import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
} from "lucide-react";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const pieData = [
  { name: "Thực phẩm", value: 3500000 },
  { name: "Nhà cửa", value: 5000000 },
  { name: "Giải trí", value: 1200000 },
  { name: "Di chuyển", value: 800000 },
  { name: "Khác", value: 500000 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const lineData = [
  { name: "Tháng 1", expense: 2400000 },
  { name: "Tháng 2", expense: 1398000 },
  { name: "Tháng 3", expense: 2800000 },
  { name: "Tháng 4", expense: 3908000 },
  { name: "Tháng 5", expense: 2800000 },
  { name: "Tháng 6", expense: 3800000 },
];

const barData = [
  { name: "Thực phẩm", weekly: 490000, monthly: 2100000 },
  { name: "Nhà cửa", weekly: 120000, monthly: 5000000 },
  { name: "Giải trí", weekly: 200000, monthly: 1200000 },
  { name: "Di chuyển", weekly: 180000, monthly: 800000 },
  { name: "Khác", weekly: 50000, monthly: 500000 },
];

const formatter = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

const ReportsPage = () => {
  const [timeRange, setTimeRange] = useState("thisMonth");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Báo cáo chi tiêu</h1>
          <p className="text-muted-foreground">
            Phân tích chi tiêu và xu hướng tài chính của bạn
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisWeek">Tuần này</SelectItem>
              <SelectItem value="thisMonth">Tháng này</SelectItem>
              <SelectItem value="lastMonth">Tháng trước</SelectItem>
              <SelectItem value="last3Months">3 tháng gần đây</SelectItem>
              <SelectItem value="thisYear">Năm nay</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng chi tiêu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">11.000.000 ₫</div>
            <p className="text-xs text-muted-foreground mt-1">
              +8% so với kỳ trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chi tiêu trung bình/ngày
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">366.000 ₫</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dựa trên 30 ngày
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Danh mục chi tiêu nhiều nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Nhà cửa</div>
            <p className="text-xs text-muted-foreground mt-1">
              45% tổng chi tiêu
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories">
        <TabsList className="mb-4">
          <TabsTrigger value="categories">
            <PieChart className="mr-2 h-4 w-4" />
            Theo danh mục
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="mr-2 h-4 w-4" />
            Xu hướng
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <BarChart3 className="mr-2 h-4 w-4" />
            So sánh
          </TabsTrigger>
        </TabsList>
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phân bổ chi tiêu theo danh mục</CardTitle>
              <CardDescription>
                Hiển thị tỷ lệ chi tiêu cho mỗi danh mục
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatter(value)} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Xu hướng chi tiêu theo thời gian</CardTitle>
              <CardDescription>
                Hiển thị chi tiêu của bạn trong 6 tháng qua
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={lineData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatter(value)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>So sánh chi tiêu tuần/tháng</CardTitle>
              <CardDescription>
                So sánh tỷ lệ chi tiêu tuần này với cả tháng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatter(value)} />
                    <Legend />
                    <Bar dataKey="weekly" name="Tuần này" fill="#8884d8" />
                    <Bar dataKey="monthly" name="Cả tháng" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
