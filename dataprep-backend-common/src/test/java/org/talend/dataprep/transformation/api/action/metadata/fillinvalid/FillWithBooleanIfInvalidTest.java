package org.talend.dataprep.transformation.api.action.metadata.fillinvalid;

import static com.google.common.collect.Sets.newHashSet;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;
import static org.talend.dataprep.transformation.api.action.metadata.ActionMetadataTestUtils.getColumn;

import java.util.*;

import org.junit.Assert;
import org.junit.Test;
import org.talend.dataprep.api.dataset.ColumnMetadata;
import org.talend.dataprep.api.dataset.DataSetRow;
import org.talend.dataprep.api.dataset.RowMetadata;
import org.talend.dataprep.api.type.Type;
import org.talend.dataprep.transformation.api.action.context.TransformationContext;
import org.talend.dataprep.transformation.api.action.metadata.ActionMetadataTestUtils;
import org.talend.dataprep.transformation.api.action.metadata.fill.AbstractFillWith;
import org.talend.dataprep.transformation.api.action.metadata.fill.FillInvalid;

/**
 * Unit test for FillWithBooleanIfInvalid action.
 *
 * @see FillInvalid
 */
public class FillWithBooleanIfInvalidTest {

    /** The action to test. */
    private FillInvalid action;

    /**
     * Default empty constructor.
     */
    public FillWithBooleanIfInvalidTest() {
        action = new FillInvalid();
        action = (FillInvalid) action.adapt(ColumnMetadata.Builder.column().type(Type.BOOLEAN).build());
    }

    @Test
    public void should_fill_non_valid_boolean() throws Exception {
        // given
        final Map<String, String> values = new HashMap<>();
        values.put("0001", "David Bowie");
        values.put("0002", "N");
        values.put("0003", "100"); // invalid boolean

        final RowMetadata rowMetadata = new RowMetadata();
        rowMetadata.setColumns(Collections.singletonList(ColumnMetadata.Builder.column() //
                .type(Type.BOOLEAN) //
                .computedId("0003") //
                .invalidValues(newHashSet("100")).build()));

        final DataSetRow row = new DataSetRow(rowMetadata, values);

        Map<String, String> parameters = ActionMetadataTestUtils
                .parseParameters(this.getClass().getResourceAsStream("fillInvalidBooleanAction.json"));

        // when
        action.applyOnColumn(row, new TransformationContext(), parameters, "0003");

        // then
        assertEquals("True", row.get("0003"));
        assertEquals("David Bowie", row.get("0001"));
    }

    @Test
    public void should_not_fill_non_valid_boolean() throws Exception {
        // given
        final Map<String, String> values = new HashMap<>();
        values.put("0001", "David Bowie");
        values.put("0002", "N");
        values.put("0003", "False"); // invalid boolean

        final RowMetadata rowMetadata = new RowMetadata();
        rowMetadata.setColumns(Collections.singletonList(ColumnMetadata.Builder.column() //
                .type(Type.BOOLEAN) //
                .computedId("0003") //
                .invalidValues(newHashSet("100")).build()));

        final DataSetRow row = new DataSetRow(rowMetadata, values);

        Map<String, String> parameters = ActionMetadataTestUtils
                .parseParameters(this.getClass().getResourceAsStream("fillInvalidBooleanAction.json"));

        // when
        action.applyOnColumn(row, new TransformationContext(), parameters, "0003");

        // then
        assertEquals("False", row.get("0003"));
        assertEquals("David Bowie", row.get("0001"));
    }

    /**
     * see https://jira.talendforge.org/browse/TDP-457
     */
    @Test
    public void should_fill_non_valid_boolean_not_in_invalid_values() throws Exception {
        // given
        final Map<String, String> values = new HashMap<>();
        values.put("0001", "David Bowie");
        values.put("0002", "N");
        values.put("0003", "753"); // invalid boolean

        final RowMetadata rowMetadata = new RowMetadata();
        rowMetadata.setColumns(Collections.singletonList(ColumnMetadata.Builder.column() //
                .type(Type.BOOLEAN) //
                .computedId("0003") //
                .invalidValues(new HashSet<>()) // no invalid values
                .build()));

        final DataSetRow row = new DataSetRow(rowMetadata, values);

        Map<String, String> parameters = ActionMetadataTestUtils
                .parseParameters(this.getClass().getResourceAsStream("fillInvalidBooleanAction.json"));

        // when
        action.applyOnColumn(row, new TransformationContext(), parameters, "0003");

        // then
        assertEquals("True", row.get("0003"));
        assertEquals("David Bowie", row.get("0001"));

        final Set<String> invalidValues = row.getRowMetadata().getById("0003").getQuality().getInvalidValues();
        assertEquals(1, invalidValues.size());
        assertTrue(invalidValues.contains("753"));
    }

    @Test
    public void should_fill_empty_string_other_column() throws Exception {
        // given
        final Map<String, String> values = new HashMap<>();
        values.put("0001", "David Bowie");
        values.put("0002", "12");
        values.put("0003", "False");

        final RowMetadata rowMetadata = new RowMetadata();
        rowMetadata.addColumn(ColumnMetadata.Builder.column().type(Type.BOOLEAN).computedId("0002").build());
        rowMetadata.addColumn(ColumnMetadata.Builder.column().type(Type.BOOLEAN).computedId("0003").build());

        final DataSetRow row = new DataSetRow(rowMetadata, values);

        Map<String, String> parameters = ActionMetadataTestUtils.parseParameters( //
                this.getClass().getResourceAsStream("fillInvalidBooleanAction.json"));

        // when
        parameters.put(AbstractFillWith.MODE_PARAMETER, AbstractFillWith.COLUMN_MODE);
        parameters.put(AbstractFillWith.SELECTED_COLUMN_PARAMETER, "0003");
        action.applyOnColumn(row, new TransformationContext(), parameters, "0002");

        // then
        Assert.assertEquals("False", row.get("0002"));
        Assert.assertEquals("David Bowie", row.get("0001"));
    }
    
    @Test
    public void should_accept_column() {
        assertTrue(action.acceptColumn(getColumn(Type.BOOLEAN)));
    }

    @Test
    public void should_adapt_null() throws Exception {
        assertThat(action.adapt(null), is(action));
    }

    @Test
    public void should_not_accept_column() {
        assertFalse(action.acceptColumn(getColumn(Type.ANY)));
    }
}