package org.talend.dataprep.api.dataset.json;

import java.io.IOException;
import java.util.List;

import org.talend.dataprep.api.dataset.ColumnMetadata;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.ObjectCodec;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

public class ColumnContextDeserializer extends JsonDeserializer<List<ColumnMetadata>> {

    @Override
    public List<ColumnMetadata> deserialize(JsonParser jsonParser, DeserializationContext deserializationContext)
            throws IOException {
        ObjectCodec oc = jsonParser.getCodec();
        final List<ColumnMetadata> columnMetadata = oc.readValue(jsonParser, new TypeReference<List<ColumnMetadata>>() {
        });
        deserializationContext.setAttribute(ColumnContextDeserializer.class.getName(), columnMetadata);
        return columnMetadata;
    }
}
