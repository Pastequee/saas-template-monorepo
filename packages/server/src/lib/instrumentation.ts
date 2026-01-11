import { opentelemetry } from '@elysiajs/opentelemetry'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import {
	BatchSpanProcessor,
	ConsoleSpanExporter,
	SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node'
import { env } from '@repo/env/server'

export const instrumentation = opentelemetry({
	autoDetectResources: false,
	spanProcessors: [
		new SimpleSpanProcessor(new ConsoleSpanExporter()),
		new BatchSpanProcessor(
			new OTLPTraceExporter({
				url: 'https://us-east-1.aws.edge.axiom.co/v1/traces',
				headers: {
					Authorization: `Bearer ${env.AXIOM_API_KEY}`,
					'X-Axiom-Dataset': env.AXIOM_DATASET,
				},
			})
		),
	],
})
