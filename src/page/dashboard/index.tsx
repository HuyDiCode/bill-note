import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils/format";

const data = [
  { name: "T2", amount: 400000 },
  { name: "T3", amount: 300000 },
  { name: "T4", amount: 520000 },
  { name: "T5", amount: 480000 },
  { name: "T6", amount: 380000 },
  { name: "T7", amount: 200000 },
  { name: "CN", amount: 280000 },
];

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tổng quan tài chính</h1>
        <div className="text-sm text-muted-foreground">
          Cập nhật gần nhất: {new Date().toLocaleDateString("vi-VN")}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng chi tiêu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2.500.000 ₫</div>
            <p className="text-xs text-muted-foreground mt-1">
              +15% so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chi tiêu tuần này
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">450.000 ₫</div>
            <p className="text-xs text-muted-foreground mt-1">
              -8% so với tuần trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Danh mục nhiều nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Thực phẩm</div>
            <p className="text-xs text-muted-foreground mt-1">
              35% tổng chi tiêu
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Chi tiêu theo ngày</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Bar dataKey="amount" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
