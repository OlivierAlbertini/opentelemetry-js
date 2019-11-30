'use strict';

const opentelemetry = require('@opentelemetry/core');
const { NodeTracer } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const EXPORTER = process.env.EXPORTER || '';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
function setupTracerAndExporters(service) {
  let exporter;
  const tracer = new NodeTracer({
    logLevel: opentelemetry.LogLevel.DEBUG,
    plugins: {
        https: {
            enabled: true,
            // if it can't find the module, put the absolute path (depending your config, since packages are not published)
            path: '@opentelemetry/plugin-https'
        },
        dns: {
          enabled: true,
          ignoreHostnames: ['localhost'],
          // if it can't find the module, put the absolute path (depending your config, since packages are not published)
          path: '/Users/ualbe94/apps/opentelemetry-js/examples/https/node_modules/@opentelemetry/plugin-dns'
      }
    }
});
require('dns');

  if (EXPORTER.toLowerCase().startsWith('z')) {
    exporter = new ZipkinExporter({
      serviceName: service
    });
  } else {
    exporter = new JaegerExporter({
      serviceName: service,
      // The default flush interval is 5 seconds.
      flushInterval: 2000
    });
  }

  tracer.addSpanProcessor(new SimpleSpanProcessor(exporter));

  // Initialize the OpenTelemetry APIs to use the BasicTracer bindings
  opentelemetry.initGlobalTracer(tracer);
}

exports.setupTracerAndExporters = setupTracerAndExporters;
