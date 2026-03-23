import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#334155' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, borderBottomWidth: 2, borderBottomColor: '#1e293b', paddingBottom: 10 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
    poNumber: { fontSize: 12, color: '#64748b', marginTop: 5 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', backgroundColor: '#f1f5f9', padding: 5, marginBottom: 10, color: '#0f172a' },
    row: { flexDirection: 'row', marginBottom: 5 },
    label: { width: 100, fontWeight: 'bold', color: '#475569' },
    value: { flex: 1, color: '#0f172a' },
    table: { width: '100%', marginTop: 10, borderWidth: 1, borderColor: '#cbd5e1' },
    tableHeaderRow: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', padding: 5, fontWeight: 'bold' },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', padding: 5 },
    colDesc: { flex: 3 },
    colQty: { flex: 1, textAlign: 'center' },
    colPrice: { flex: 1, textAlign: 'right' },
    colTotal: { flex: 1, textAlign: 'right' },
    summary: { marginTop: 20, alignItems: 'flex-end' },
    summaryRow: { flexDirection: 'row', width: 200, justifyContent: 'space-between', marginBottom: 5 },
    summaryTotal: { flexDirection: 'row', width: 200, justifyContent: 'space-between', paddingTop: 5, borderTopWidth: 2, borderTopColor: '#0f172a', fontWeight: 'bold', fontSize: 12 },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#94a3b8', fontSize: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10 }
})

export const PurchaseOrderPDF = ({ rfq, bid, date }: { rfq: any, bid: any, date: string }) => {
    const totalAmount = Number(bid.amount)

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>ORDEN DE COMPRA</Text>
                        <Text style={styles.poNumber}>PO-{rfq.id.substring(0, 8).toUpperCase()}</Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{rfq.company?.name}</Text>
                        <Text>NIT: {rfq.company?.nit}</Text>
                        <Text>Fecha: {date}</Text>
                    </View>
                </View>

                {/* Supplier Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>FACTURAR Y ENTREGAR A</Text>
                    <View style={styles.row}><Text style={styles.label}>Cliente:</Text><Text style={styles.value}>{rfq.company?.name}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Referencia RFQ:</Text><Text style={styles.value}>{rfq.title}</Text></View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PROVEEDOR ADJUDICADO</Text>
                    <View style={styles.row}><Text style={styles.label}>Empresa:</Text><Text style={styles.value}>{bid.company?.name}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>NIT:</Text><Text style={styles.value}>{bid.company?.nit}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Plazo Entrega:</Text><Text style={styles.value}>{bid.deliveryLeadTime || 'No especificado'}</Text></View>
                </View>

                {/* Table Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>DETALLE DE PRODUCTOS / SERVICIOS</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeaderRow}>
                            <Text style={styles.colDesc}>Descripción</Text>
                            <Text style={styles.colQty}>Cantidad</Text>
                            <Text style={styles.colPrice}>Precio Unit.</Text>
                            <Text style={styles.colTotal}>Total</Text>
                        </View>
                        {bid.items?.map((item: any, i: number) => (
                            <View key={i} style={styles.tableRow}>
                                <Text style={styles.colDesc}>{item.rfqItem?.name || 'Item'} {item.remarks ? `(${item.remarks})` : ''}</Text>
                                <Text style={styles.colQty}>{item.rfqItem?.quantity} {item.rfqItem?.unit}</Text>
                                <Text style={styles.colPrice}>Q {Number(item.unitPrice).toFixed(2)}</Text>
                                <Text style={styles.colTotal}>Q {Number(item.totalPrice).toFixed(2)}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Totals */}
                <View style={styles.summary}>
                    <View style={styles.summaryTotal}>
                        <Text>TOTAL ORDEN:</Text>
                        <Text>Q {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Este documento es una adjudicación formal emitida digitalmente a través de la plataforma Abastto B2B.</Text>
                    <Text>Cualquier modificación a esta orden debe ser autorizada por el comprador.</Text>
                </View>
            </Page>
        </Document>
    )
}
