import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";

function AnimatedNumber({
  value,
  duration = 1000,
  suffix = "",
  decimals = 0,
  ...props
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const numericValue = Number(value) || 0;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplay(progress * numericValue);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplay(numericValue);
      }
    };

    requestAnimationFrame(step);
  }, [value, duration]);

  return (
    <span {...props}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function KpiCard({
  label,
  value,
  color,
  subtitle,
  suffix = "",
  decimals = 0,
  animated = true,
}) {
  return (
    <Card
      sx={{
        background: "#ffffff",
        borderRadius: 2,
        boxShadow: "none",
        border: "1px solid #E5EAF2",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: "#64748B",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontSize: "0.75rem",
            mb: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: color || "#4A90E2",
            }}
          />
          {label}
        </Typography>
        <Typography
          variant="h4"
          sx={{ color: "#0F172A", fontWeight: 700, mb: 0.5 }}
        >
          {animated ? (
            <AnimatedNumber value={value} suffix={suffix} decimals={decimals} />
          ) : (
            `${Number(value || 0).toFixed(decimals)}${suffix}`
          )}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: "#94A3B8" }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
