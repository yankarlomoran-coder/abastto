import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 40,
        fontFamily: 'Helvetica'
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#4f46e5',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e1b4b',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        color: '#64748b',
    },
    section: {
        marginTop: 20,
        marginBottom: 10,
    },
    paragraph: {
        fontSize: 11,
        color: '#334155',
        marginBottom: 8,
        lineHeight: 1.5,
    },
    bold: {
        fontWeight: 'bold',
        color: '#0f172a',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 10,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10,
    }
})

// Quick helper to strip heavy markdown asterisks and return clean chunks
const cleanMarkdownItems = (text: string) => {
    // Split by new lines to render them sequentially
    return text.split('\n').filter(line => line.trim() !== '')
}

export const ComparativeAnalysisPDF = ({ rfqId, analysisText, date }: { rfqId: string, analysisText: string, date: string }) => {
    const lines = cleanMarkdownItems(analysisText)

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Reporte de Análisis Comparativo (IA)</Text>
                    <Text style={styles.subtitle}>Generado por Abastto AI Intelligence</Text>
                    <Text style={styles.subtitle}>Referencia Licitación: {rfqId}</Text>
                    <Text style={styles.subtitle}>Fecha de Evaluación: {date}</Text>
                </View>

                <View style={styles.section}>
                    {lines.map((line, index) => {
                        // Quick bold parser **bold**
                        const isListItem = line.trim().startsWith('* ') || line.trim().startsWith('- ')
                        const textContent = line.replace(/^\* |^- /, '').trim().replace(/\*\*/g, '')

                        return (
                            <Text key={index} style={styles.paragraph}>
                                {isListItem ? `• ${textContent}` : textContent}
                            </Text>
                        )
                    })}
                </View>

                <View style={styles.footer}>
                    <Text>Confidencial. Este documento fue generado automáticamente por Inteligencia Artificial y sirve únicamente como apoyo a la toma de decisiones gerenciales.</Text>
                </View>
            </Page>
        </Document>
    )
}
