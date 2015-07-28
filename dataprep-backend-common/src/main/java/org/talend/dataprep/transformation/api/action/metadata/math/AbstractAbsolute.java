package org.talend.dataprep.transformation.api.action.metadata.math;

import org.talend.dataprep.transformation.api.action.metadata.common.SingleColumnAction;

public abstract class AbstractAbsolute  extends SingleColumnAction {

    /**
     * Try to parse and return the absolute value of a long value as string
     * @param value The value to execute action
     * @return the absolute value or null
     */
    protected String executeOnLong(final String value) {
        try {
            long longValue = Long.parseLong(value);
            return Long.toString(Math.abs(longValue));
        } catch (NumberFormatException nfe1) {
            return null;
        }
    }

    /**
     * * Try to parse and return the absolute value of a long value as string
     * @param value The value to execute action
     * @return the absolute value or null
     */
    protected String executeOnFloat(final String value) {
        try {
            double doubleValue = Double.parseDouble(value);
            double absValue = Math.abs(doubleValue);
            if (absValue == (long) absValue) {// this will prevent having .0 for longs.
                return String.format("%d", (long) absValue); //$NON-NLS-1$
            } else {
                return String.format("%s", absValue); //$NON-NLS-1$
            }
        } catch (NumberFormatException nfe2) {
            return null;
        }
    }
}
